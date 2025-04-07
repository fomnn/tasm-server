import { jwt } from "hono/jwt";
import { createRouter } from "../helpers/hono";

export const userTaskRouter = createRouter()
  .basePath("/user/tasks")
  .use("*", (c, next) => {
    const jwtMiddleware = jwt({
      secret: c.env.JWT_ACCESS_SECRET,
    });

    return jwtMiddleware(c, next);
  })
  .get("/", async (c) => {
    const prisma = c.get("prisma");
    const { id } = c.get("jwtPayload");

    const workspaces = await prisma.workspaces.findMany({
      where: {
        WorkspaceMembers: {
          some: {
            userId: id,
          },
        },
      },
      select: {
        id: true,
      },
    });

    const workspaceIds = workspaces.map(w => w.id);

    const projects = await prisma.projects.findMany({
      where: {
        workspaceId: {
          in: workspaceIds,
        },
      },
      select: {
        id: true,
      },
    });

    const projectIds = projects.map(p => p.id);

    const tasks = await prisma.tasks.findMany({
      where: {
        projectId: {
          in: projectIds,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return c.json(tasks);
  });
