import { createRouter } from "./helpers/hono";
import authRouter from "./routes/auth.router";
import { imageRouter } from "./routes/image.router";
import { profilePictureRouter } from "./routes/profile-picture.router";
import { profileRouter } from "./routes/profile.router";
import { userActivityRouter } from "./routes/user-activity.router";
import { userTaskRouter } from "./routes/user-task.router";
import { workspaceActivityRouter } from "./routes/workspace-activity.router";
import { workspaceMemberRouter } from "./routes/workspace-member.router";
import { workspaceProjectTaskAssigneeRouter } from "./routes/workspace-project-task-assignee.router";
import { workspaceProjectTaskRouter } from "./routes/workspace-project-task.router";
import { workspaceProjectRouter } from "./routes/workspace-project.router";
import { workspaceTaskRouter } from "./routes/workspace-task.router";
import { workspaceRouter } from "./routes/workspace.router";

const routers = createRouter();

routers.route("/", userTaskRouter);
routers.route("/", authRouter);
routers.route("/", workspaceRouter);
routers.route("/", profileRouter);
routers.route("/", userActivityRouter);
routers.route("/", workspaceProjectRouter);
routers.route("/", workspaceActivityRouter);
routers.route("/", workspaceProjectRouter);
routers.route("/", workspaceProjectTaskRouter);
routers.route("/", workspaceMemberRouter);
routers.route("/", workspaceTaskRouter);
routers.route("/", workspaceProjectTaskAssigneeRouter);
routers.route("/", profilePictureRouter);
routers.route("/", imageRouter);

export default routers;
