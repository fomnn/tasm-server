import { zValidator } from "@hono/zod-validator";
import { jwt } from "hono/jwt";
import createRouter from "../lib/hono";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../validators/workspace-schemas";

export const workspaceRouter = createRouter()
  .basePath("/workspaces")
  .use((c, next) => {
    const jwtMiddleware = jwt({
      secret: c.env.JWT_SECRET,
    });

    return jwtMiddleware(c, next);
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
  .post(
    "/",
    zValidator("json", createWorkspaceSchema),
    async (c) => {
      const prisma = c.get("prisma");
      const { id: userId } = c.get("jwtPayload");

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
