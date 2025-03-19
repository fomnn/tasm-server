import createRouter from "../lib/hono";

export const userActivityRouter = createRouter()
  .basePath("/users/:userId/activities")
  .get("/", async (c) => {
    const prisma = c.get("prisma");
    const userId = c.req.param("userId");

    const activities = await prisma.activities.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return c.json({
      activities
    })
  })
