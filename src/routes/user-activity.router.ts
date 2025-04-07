import { jwt } from "hono/jwt";
import { createRouter } from "../helpers/hono";

export const userActivityRouter = createRouter()
  .basePath("/activities")
  .use("*", (c, next) => {
    const jwtMiddleware = jwt({
      secret: c.env.JWT_ACCESS_SECRET,
    });

    return jwtMiddleware(c, next);
  })
  .get("/", async (c) => {
    const prisma = c.get("prisma");
    const {
      id: userId,
    } = c.get("jwtPayload");

    const activities = await prisma.activities.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return c.json(activities);
  })
  .get("/:id/profile", async (c) => {
    const prisma = c.get("prisma");
    const id = c.req.param("id");

    const activity = await prisma.activities.findFirst({
      where: {
        id,
      },
    });
    const profile = await prisma.profiles.findFirst({
      where: {
        userId: activity?.userId,
      },
    });

    return c.json(profile);
  });
