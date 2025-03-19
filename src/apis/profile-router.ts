import { zValidator } from "@hono/zod-validator";
import { jwt } from "hono/jwt";
import createRouter from "../lib/hono";
import { updateProfileSchema } from "../validators/profile-schemas";

export const profileRouter = createRouter()
  .basePath("/profiles")
  .use((c, next) => {
    const jwtMiddleware = jwt({
      secret: c.env.JWT_SECRET,
    });

    return jwtMiddleware(c, next);
  })
  .get("/:id", async (c) => {
    const prisma = c.get("prisma");
    const id = c.req.param("id");

    const profile = await prisma.profiles.findUnique({
      where: { id },
    });

    if (!profile) {
      return c.json({
        error: "Profile not found",
      }, 404);
    }

    return c.json(profile);
  })
  .put(
    "/:id",
    zValidator("json", updateProfileSchema),
    async (c) => {
      const prisma = c.get("prisma");
      const { id: userId } = c.get("jwtPayload");
      const id = c.req.param("id");

      const { username, bio, name } = c.req.valid("json");

      const profile = await prisma.profiles.update({
        where: {
          id,
          userId,
        },
        data: {
          username,
          bio,
          name,
        },
      });

      return c.json(profile);
    },
  );
