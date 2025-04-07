import { createRouter } from "../helpers/hono";

export const workspaceTaskRouter = createRouter()
  .basePath("/workspaces/:workspaceId/tasks")
  .get("/", async (c) => {
    const prisma = c.get("prisma");
    const workspaceId = c.req.param("workspaceId");
    const take = c.req.query("take");

    const tasks = await prisma.tasks.findMany({
      where: {
        Project: {
          workspaceId,
        },
      },
      ...(take
        ? {
            take: Number.parseInt(take),
          }
        : {}),
    });

    return c.json(tasks);
  });
