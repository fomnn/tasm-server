import { zValidator } from "@hono/zod-validator";
import { jwt } from "hono/jwt";
import { createRouter } from "../helpers/hono";
import { workspaceMemberOnly } from "../middlewares/workspace-member-only";
import { createActivitySchema } from "../validators/activity.schema";

export const workspaceActivityRouter = createRouter()
  .basePath("/workspaces/:workspaceId/activities")
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

    const activities = await prisma.activities.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return c.json(activities);
  })
  .post(
    "/",
    zValidator("json", createActivitySchema),
    async (c) => {
      const prisma = c.get("prisma");
      const { id: userId } = c.get("jwtPayload");
      const workspaceId = c.req.param("workspaceId");
      const {
        title,
        description,
      } = c.req.valid("json");

      const activity = await prisma.activities.create({
        data: {
          title,
          description,
          userId,
          workspaceId,
        },
      });

      return c.json({
        activity,
      });
    },
  );
