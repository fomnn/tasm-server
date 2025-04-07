import { jwt } from "hono/jwt";
import { createRouter } from "../helpers/hono";

export const profilePictureRouter = createRouter()
  .basePath("/profile-pic")
  .use("*", (c, next) => {
    if (c.req.method === "GET") {
      return next();
    }

    const jwtMiddleware = jwt({
      secret: c.env.JWT_ACCESS_SECRET,
    });

    return jwtMiddleware(c, next);
  })
  .post("/upload", async (c) => {
    const prisma = c.get("prisma");
    const { id: userId } = c.get("jwtPayload");
    const bucket = c.env.tasm_bucket;
    const formdata = await c.req.formData();

    const file = formdata.get("profilePic") as File | null;

    if (!file) {
      return c.json({
        message: "there is no image uploaded",
      }, 400);
    }

    const ext = file.name.split(".")[file.name.split(".").length - 1];
    const filepath = `profilePictures/profile-picture__${userId}.${ext}`;

    if (!c.env.API_HOST) {
      return c.json({
        message: "can not read api_host",
      }, 500);
    }

    const url = `${c.env.API_HOST}/api/images/${filepath}`;

    const profile = await prisma.profiles.findFirst({
      where: {
        userId,
      },
      select: {
        // TODO: column for profile picture in profile table?
        profilePictureUrl: true,
        id: true,
      },
    });

    if (!profile) {
      return c.json({
        message: "profile not found",
      }, 404);
    }

    try {
      await bucket.put(filepath, file);

      await prisma.profiles.update({
        where: {
          id: profile.id,
        },
        data: {
          profilePictureUrl: url,
        },
      });
      return c.json({
        message: "success",
      });
    }
    catch (e) {
      console.error(e);
      return c.json({
        message: "there is an error",
        e,
      }, 500);
    }
  });
