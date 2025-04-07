import type { Projects } from "@prisma/client";
import { zValidator } from "@hono/zod-validator";
import { jwt } from "hono/jwt";
import { createRouter } from "../helpers/hono";
import { workspaceMemberOnly } from "../middlewares/workspace-member-only";
import { createProjectSchema, updateProjectSchema } from "../validators/project.schema";

export const workspaceProjectRouter = createRouter()
  .basePath("workspaces/:workspaceId/projects")
  .use("*", (c, next) => {
    const jwtMiddleware = jwt({
      secret: c.env.JWT_ACCESS_SECRET,
    });

    return jwtMiddleware(c, next);
  })
  .use("*", workspaceMemberOnly)
  .get("/", async (c) => {
    const prisma = c.get("prisma");
    const workspaceId = c.req.param("workspaceId");
    const status = c.req.query("status");

    const projects = await prisma.projects.findMany({
      where: {
        workspaceId,
      },
    });

    if (status) {
      const projectsWithStatus: (Projects & {
        isFinished: boolean;
      })[] = [];

      for (const project of projects) {
        const tasks = await prisma.tasks.findMany({
          where: {
            projectId: project.id,
          },
        });

        if (tasks.length === 0) {
          projectsWithStatus.push({
            ...project,
            isFinished: false,
          });
          continue;
        }

        const done = tasks.every(task => task.stage === "DONE");

        if (done) {
          projectsWithStatus.push({
            ...project,
            isFinished: true,
          });
        }
        else {
          projectsWithStatus.push({
            ...project,
            isFinished: false,
          });
        }
      }

      return c.json(projectsWithStatus);
    }

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
