import { zValidator } from "@hono/zod-validator";
import { jwt } from "hono/jwt";
import { createRouter } from "../helpers/hono";
import { updateProfileSchema } from "../validators/profile.schema";

export const profileRouter = createRouter()
  .basePath("/profiles")
  .use("*", (c, next) => {
    const jwtMiddleware = jwt({
      secret: c.env.JWT_ACCESS_SECRET,
    });

    return jwtMiddleware(c, next);
  })
  .get("/", async (c) => {
    const prisma = c.get("prisma");
    const { id: userId } = c.get("jwtPayload");

    const profile = await prisma.profiles.findFirst({
      where: {
        userId,
      },
    });

    if (!profile) {
      return c.json({
        message: "profile not found",
      }, 404);
    }

    return c.json(profile);
  })
  .get("/user/:userId", async (c) => {
    const prisma = c.get("prisma");
    const userId = c.req.param("userId");

    const profile = await prisma.profiles.findFirst({
      where: {
        userId,
      },
    });

    return c.json(profile);
  })
  .put(
    "/:id",
    zValidator("json", updateProfileSchema),
    async (c) => {
      const prisma = c.get("prisma");
      const { id: userId } = c.get("jwtPayload");
      const id = c.req.param("id");

      const { username, name, email } = c.req.valid("json");

      const profile = await prisma.profiles.update({
        where: {
          id,
          userId,
        },
        data: {
          username,
          name,
        },
      });

      if (email) {
        await prisma.users.update({
          where: {
            id: userId,
          },
          data: {
            email,
          },
        });
      }

      return c.json(profile);
    },
  );
