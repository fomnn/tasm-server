import { zValidator } from "@hono/zod-validator";
import { jwt } from "hono/jwt";
import createRouter from "../lib/hono";
import workspaceMemberOnly from "../middlewares/workspace-member-only";
import { createTaskSchema, updateTaskSchema } from "../validators/task-schemas";

export const workspaceProjectTaskRouter = createRouter()
  .basePath("/workspaces/:workspaceId/projects/:projectId/tasks")
  .use("*", (c, next) => {
    const jwtMiddleware = jwt({
      secret: c.env.JWT_SECRET,
    });

    return jwtMiddleware(c, next);
  })
  .use("*", workspaceMemberOnly)
  .get("/", async (c) => {
    const prisma = c.get("prisma");
    const projectId = c.req.param("projectId");

    const projects = await prisma.tasks.findMany({
      where: {
        projectId,
      },
    });

    return c.json(projects);
  })
  .get(
    "/:id",
    async (c) => {
      const prisma = c.get("prisma");
      const id = c.req.param("id");

      const task = await prisma.tasks.findUnique({
        where: {
          id,
        },
      });

      return c.json({
        task,
      });
    },
  )
  .post(
    "/",
    zValidator("json", createTaskSchema),
    async (c) => {
      const prisma = c.get("prisma");
      const projectId = c.req.param("projectId");
      const {
        title,
        assigneeIds,
        description,
        parentTaskId,
        priority,
        stage,
      } = c.req.valid("json");

      const task = await prisma.tasks.create({
        data: {
          title,
          priority: priority || "LOW",
          description,
          parentTaskId,
          stage,
          projectId,
          ...(
            assigneeIds
            && {
              TaskAssignees: {
                createMany: {
                  data: assigneeIds.map(assigneeId => ({
                    userId: assigneeId,
                  })),
                },
              },
            }
          ),
        },
      });

      return c.json({
        task,
      });
    },
  )
  .put(
    "/:id",
    zValidator("json", updateTaskSchema),
    async (c) => {
      const prisma = c.get("prisma");
      const projectId = c.req.param("projectId");
      const {
        title,
        assigneeIds,
        description,
        parentTaskId,
        priority,
        stage,
      } = c.req.valid("json");

      const id = c.req.param("id");

      const taskIsExist = await prisma.tasks.findUnique({
        where: {
          id,
        },
      });

      if (!taskIsExist) {
        return c.json({
          message: "Task not found",
        }, 404);
      }

      const task = await prisma.tasks.update({
        where: {
          id,
        },
        data: {
          title,
          priority: priority || "LOW",
          description,
          parentTaskId,
          stage,
          projectId,
          ...(assigneeIds && {
            TaskAssignees: {
              deleteMany: {},
              createMany: {
                data: assigneeIds.map(assigneeId => ({
                  userId: assigneeId,
                })),
              },
            },
          }),
        },
      });

      return c.json({
        task,
      });
    },
  )
  .delete(
    "/:id",
    async (c) => {
      const prisma = c.get("prisma");
      const id = c.req.param("id");

      await prisma.tasks.delete({
        where: {
          id,
        },
      });

      c.status(204);
      return c.text("deleted");
    },
  );
