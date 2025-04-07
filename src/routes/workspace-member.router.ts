import { zValidator } from "@hono/zod-validator";
import { jwt } from "hono/jwt";
import { createRouter } from "../helpers/hono";
import { workspaceMemberOnly } from "../middlewares/workspace-member-only";
import { createWorkspaceMemberSchema, updateWorkspaceMemberSchema } from "../validators/workspace-member.schema";

export const workspaceMemberRouter = createRouter()
  .basePath("/workspaces/:workspaceId/members")
  .use("*", (c, next) => {
    const jwtMiddleware = jwt({
      secret: c.env.JWT_ACCESS_SECRET,
    });

    return jwtMiddleware(c, next);
  })
  .use("*", workspaceMemberOnly)
  .get("/", async (c) => {
    const prisma = c.get("prisma");
    const withName = c.req.query("withName");

    const workspaceId = c.req.param("workspaceId");

    if (withName) {
      const members = await prisma.workspaceMembers.findMany({
        where: {
          workspaceId,
        },
        include: {
          User: {
            select: {
              Profile: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return c.json(members.map(m => ({
        ...m,
        name: m.User.Profile[0].name,
      })));
    }
    const members = await prisma.workspaceMembers.findMany({
      where: {
        workspaceId,
      },
    });

    return c.json(members);
  })
  .get("/:id", async (c) => {
    const prisma = c.get("prisma");

    const id = c.req.param("id");

    const member = await prisma.workspaceMembers.findUnique({
      where: { id },
    });

    if (!member) {
      return c.json({
        error: "Member not found",
      }, 404);
    }

    return c.json(member);
  })
  .post(
    "/",
    zValidator("json", createWorkspaceMemberSchema),
    async (c) => {
      const prisma = c.get("prisma");
      const workspaceId = c.req.param("workspaceId");
      const {
        role,
        userId,
      } = c.req.valid("json");

      const member = await prisma.workspaceMembers.create({
        data: {
          role,
          userId,
          workspaceId,
        },
      });

      return c.json(member);
    },
  )
  .put(
    "/:id",
    zValidator("json", updateWorkspaceMemberSchema),
    async (c) => {
      const prisma = c.get("prisma");
      const workspaceId = c.req.param("workspaceId");
      const {
        role,
      } = c.req.valid("json");
      const id = c.req.param("id");

      const workspaceMemberIsExist = await prisma.workspaceMembers.findFirst({
        where: {
          id,
          workspaceId,
        },
      });

      if (!workspaceMemberIsExist) {
        return c.json({
          error: "Member not found",
        }, 404);
      }

      const member = await prisma.workspaceMembers.update({
        where: {
          id,
        },
        data: {
          role,
        },
      });

      return c.json(member);
    },
  )
  .delete(
    "/:id",
    async (c) => {
      const prisma = c.get("prisma");
      const id = c.req.param("id");

      await prisma.workspaceMembers.delete({
        where: {
          id,
        },
      });

      return c.json({
        message: "Member deleted",
      });
    },
  );
