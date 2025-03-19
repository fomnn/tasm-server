import authRouter from "./apis/auth-router";
import { profileRouter } from "./apis/profile-router";
import { workspaceActivityRouter } from "./apis/workspace-activity-router";
import { workspaceMemberRouter } from "./apis/workspace-member-router";
import { workspaceProjectRouter } from "./apis/workspace-project-router";
import { workspaceProjectTaskRouter } from "./apis/workspace-project-task-router";
import { workspaceRouter } from "./apis/workspace-router";
import createRouter from "./lib/hono";
import { usePrisma } from "./lib/prisma";

const routers = createRouter().basePath("/api");

routers.get("/", async (c) => {
  const prisma = usePrisma(c.env.DB);

  const user = await prisma.users.findMany();

  return c.json({
    user,
  });
});

routers.route("/", authRouter);
routers.route("/", workspaceRouter);
routers.route("/", profileRouter);
routers.route("/", workspaceProjectRouter);
routers.route("/", workspaceActivityRouter);
routers.route("/", workspaceProjectRouter);
routers.route("/", workspaceProjectTaskRouter);
routers.route("/", workspaceMemberRouter);
export default routers;
