import { jwt } from "hono/jwt";
import { createRouter } from "../helpers/hono";
import { workspaceMemberOnly } from "../middlewares/workspace-member-only";

export const workspaceProjectTaskAssigneeRouter = createRouter()
  .basePath("/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/assignees")
  .use("*", (c, next) => {
    const jwtMiddleware = jwt({
      secret: c.env.JWT_ACCESS_SECRET,
    });

    return jwtMiddleware(c, next);
  })
  .use("*", workspaceMemberOnly)
  .get("/", async (c) => {
    const prisma = c.get("prisma");
    const taskId = c.req.param("taskId");

    const assignees = await prisma.taskAssignees.findMany({
      where: {
        taskId,
      },
    });

    return c.json(assignees);
  });
