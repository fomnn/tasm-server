import { zValidator } from "@hono/zod-validator";
import Cryptr from "cryptr";
import { getCookie } from "hono/cookie";
import { jwt } from "hono/jwt";
import { createActivity } from "../helpers/activity";
import { createRouter } from "../helpers/hono";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../validators/workspace.schema";

const cryptr = new Cryptr("InvitationEncryptionSecret");

export const workspaceRouter = createRouter()
  .basePath("/workspaces")
  .use("*", (c, next) => {
    if (c.req.path === "/api/workspaces/verify-invitation") {
      return next();
    }
    else if (c.req.path.startsWith("/api/workspaces/") && c.req.method === "GET") {
      return next();
    }
    else {
      const jwtMiddleware = jwt({
        secret: c.env.JWT_ACCESS_SECRET,
      });

      return jwtMiddleware(c, next);
    }
  })
  .get("/", async (c) => {
    const prisma = c.get("prisma");
    const { id: userId } = c.get("jwtPayload");

    const workspaces = await prisma.workspaces.findMany({
      where: {
        WorkspaceMembers: {
          some: {
            userId,
          },
        },
      },
    });

    return c.json(workspaces);
  })
  .get("/:id", async (c) => {
    const prisma = c.get("prisma");
    const id = c.req.param("id");

    const workspace = await prisma.workspaces.findUnique({
      where: { id },
    });

    if (!workspace) {
      return c.json({
        error: "Workspace not found",
      }, 404);
    }

    return c.json(workspace);
  })
  .post("/:id/create-invitation", async (c) => {
    const workspaceId = c.req.param("id");

    const invitationData = {
      workspaceId,
      expireAt: new Date(new Date().getTime() + 20 * 60 * 1000),
    };

    const code = cryptr.encrypt(JSON.stringify(invitationData));

    return c.json({
      code,
    });
  })
  .post("/verify-invitation", async (c) => {
    const prisma = c.get("prisma");
    const { code, userId } = await c.req.json();

    const invitationData = JSON.parse(cryptr.decrypt(code)) as { workspaceId: string; expireAt: Date };

    if (invitationData.expireAt < new Date()) {
      return c.json({ message: "invitation is expired" }, 410);
    }

    const workspace = await prisma.workspaces.findFirst({
      where: {
        id: invitationData.workspaceId,
      },
    });

    if (!workspace) {
      return c.json({
        message: "workspace not found",
      }, 404);
    }

    if (userId) {
      const alreadyMember = await prisma.workspaces.findFirst({
        where: {
          id: workspace.id,
          WorkspaceMembers: {
            some: {
              userId: userId as string,
            },
          },
        },
      });

      if (alreadyMember) {
        return c.json({
          workspace,
          alreadyMember: true,
          status: "ok",
        }, 200);
      }
    }

    return c.json({
      workspace,
      status: "ok",
    }, 200);
  })
  .post("/:id/add-member", async (c) => {
    const { id: userId } = c.get("jwtPayload");
    const prisma = c.get("prisma");
    const workspaceId = c.req.param("id");

    await prisma.workspaceMembers.create({
      data: {
        workspaceId,
        userId,
        role: "MEMBER",
      },
    });
    
    return c.json({
      message: "success add to workspace",
    }, 201);
  })
  .post(
    "/",
    zValidator("json", createWorkspaceSchema),
    async (c) => {
      const prisma = c.get("prisma");
      const { id: userId } = c.get("jwtPayload");

      const profile = await prisma.profiles.findFirst({
        where: {
          userId,
        },
      });

      const { name } = c.req.valid("json");

      const workspace = await prisma.workspaces.create({
        data: {
          name,
          WorkspaceMembers: {
            create: {
              userId,
              role: "ADMIN",
            },
          },
        },
      });

      await createActivity(c, {
        title: "Workspace baru dibuat",
        description: `Workspace dengan nama ${workspace.name} baru saja dibuat oleh ${profile?.name}`,
        workspaceId: workspace.id,
        userId,
      });

      return c.json(workspace, 201);
    },
  )
  .put(
    "/:id",
    zValidator("json", updateWorkspaceSchema),
    async (c) => {
      const prisma = c.get("prisma");
      const id = c.req.param("id");
      const { id: userId } = c.get("jwtPayload");

      const { name } = c.req.valid("json");

      const workspace = await prisma.workspaces.findUnique({
        where: { id },
      });

      if (!workspace) {
        return c.json({
          error: "Workspace not found",
        }, 404);
      }

      const workspaceMember = await prisma.workspaceMembers.findFirst({
        where: {
          workspaceId: id,
          userId,
        },
      });

      if (workspaceMember?.role !== "ADMIN") {
        return c.json({
          error: "You are not allowed to update this workspace",
        }, 403);
      }

      const updatedWorkspace = await prisma.workspaces.update({
        where: { id },
        data: { name },
      });

      return c.json(updatedWorkspace);
    },
  )
  .delete("/:id", async (c) => {
    const prisma = c.get("prisma");
    const id = c.req.param("id");
    const { id: userId } = c.get("jwtPayload");

    const workspaceMember = await prisma.workspaceMembers.findFirst({
      where: {
        workspaceId: id,
        userId,
      },
    });

    if (workspaceMember?.role !== "ADMIN") {
      return c.json({
        error: "You are not allowed to delete this workspace",
      }, 403);
    }

    await prisma.workspaces.delete({
      where: { id },
    });

    c.status(204);
    return c.text("deleted");
  });
