import { zValidator } from "@hono/zod-validator";
import { jwt } from "hono/jwt";
import createRouter from "../lib/hono";
import workspaceMemberOnly from "../middlewares/workspace-member-only";
import { createProjectSchema, updateProjectSchema } from "../validators/project-schemas";

export const workspaceProjectRouter = createRouter()
  .basePath("workspaces/:workspaceId/projects")
  .use("*", (c, next) => {
    const jwtMiddleware = jwt({
      secret: c.env.JWT_SECRET,
    });

    return jwtMiddleware(c, next);
  })
  .use("*", workspaceMemberOnly)
  .get("/", async (c) => {
    const prisma = c.get("prisma");

    const workspaceId = c.req.param("workspaceId");

    const projects = await prisma.projects.findMany({
      where: {
        workspaceId,
      },
    });

    return c.json(projects);
  })
  .get("/:id", async (c) => {
    const prisma = c.get("prisma");

    const id = c.req.param("id");

    const project = await prisma.projects.findUnique({
      where: { id },
    });

    if (!project) {
      return c.json({
        error: "Project not found",
      }, 404);
    }

    return c.json(project);
  })
  .post(
    "/",
    zValidator("json", createProjectSchema),
    async (c) => {
      const prisma = c.get("prisma");
      const workspaceId = c.req.param("workspaceId");
      const { id: userId } = c.get("jwtPayload");
      const { name, description } = c.req.valid("json");

      const workspace = await prisma.workspaceMembers.findFirst({
        where: {
          workspaceId,
          userId,
        },
      });

      if (workspace?.role !== "ADMIN") {
        return c.json({
          message: "You are not allowed to create project in this workspace",
        });
      }

      const project = await prisma.projects.create({
        data: {
          name,
          description,
          workspaceId,
        },
      });

      return c.json({
        project,
      }, 201);
    },
  )
  .put(
    "/:id",
    zValidator("json", updateProjectSchema),
    async (c) => {
      const prisma = c.get("prisma");
      const workspaceId = c.req.param("workspaceId");
      const id = c.req.param("id");
      const { id: userId } = c.get("jwtPayload");
      const { name, description } = c.req.valid("json");

      const workspace = await prisma.workspaceMembers.findFirst({
        where: {
          workspaceId,
          userId,
        },
      });

      if (workspace?.role !== "ADMIN") {
        return c.json({
          message: "You are not allowed to update project in this workspace",
        });
      }

      const project = await prisma.projects.update({
        where: {
          id,
        },
        data: {
          name,
          description,
        },
      });

      return c.json({
        project,
      });
    },
  )
  .delete(
    "/:id",
    async (c) => {
      const prisma = c.get("prisma");
      const id = c.req.param("id");
      const workspaceId = c.req.param("workspaceId");
      const { id: userId } = c.get("jwtPayload");

      const workspace = await prisma.workspaceMembers.findFirst({
        where: {
          workspaceId,
          userId,
        },
      });

      if (workspace?.role !== "ADMIN") {
        return c.json({
          message: "You are not allowed to delete project in this workspace",
        });
      }

      await prisma.projects.delete({
        where: {
          id,
        },
      });

      c.status(204);
      return c.text("deleted");
    },
  );
