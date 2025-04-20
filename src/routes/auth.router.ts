import type { MyJWTPayload } from "../helpers/hono";
import { zValidator } from "@hono/zod-validator";
import { decode, jwt } from "hono/jwt";
import { digest } from "ohash";
import { z } from "zod";
import { createRouter } from "../helpers/hono";
import { deleteRefreshToken, getRefreshToken, saveRefreshToken } from "../helpers/refreshToken";
import { generateTokens } from "../utils/generate-tokens";
import { loginSchema, signupSchema } from "../validators/auth.schema";

const authRouter = createRouter().basePath("/auth");
authRouter.use("/verify", (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_ACCESS_SECRET,
  });

  return jwtMiddleware(c, next);
});
authRouter.post(
  "/login",
  zValidator("json", loginSchema),
  async (c) => {
    const prisma = c.get("prisma");

    const {
      email,
      password,
    } = c.req.valid("json");

    const user = await prisma.users.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return c.json({
        error: "User not found",
      }, 404);
    }

    const isPasswordValid = digest(user.password) === password;

    if (!isPasswordValid) {
      return c.json({
        error: "Invalid password",
      }, 401);
    }

    const { accessToken, refreshToken } = await generateTokens(
      user.id,
      c.env.JWT_ACCESS_SECRET,
      c.env.JWT_REFRESH_SECRET,
    );

    await saveRefreshToken(c, user.id, refreshToken);

    return c.json({
      user,
      token: accessToken,
    });
  },
);
authRouter.post(
  "/signup",
  zValidator("json", signupSchema),
  async (c) => {
    const prisma = c.get("prisma");

    const {
      email,
      name,
      password,
      username,
    } = c.req.valid("json");

    const emailAlreadyExists = await prisma.users.findFirst({
      where: {
        email,
      },
    });

    if (emailAlreadyExists) {
      return c.json({
        error: "Email already exists",
      }, 401);
    }

    const usernameAlreadyExists = await prisma.profiles.findFirst({
      where: {
        username,
      },
    });

    if (usernameAlreadyExists) {
      return c.json({
        error: "Username already exists",
      }, 401);
    }

    const user = await prisma.users.create({
      data: {
        email,
        password: digest(password),
        Profile: {
          create: {
            name,
            username,
            email,
          },
        },
      },
    });

    const { accessToken, refreshToken } = await generateTokens(
      user.id,
      c.env.JWT_ACCESS_SECRET,
      c.env.JWT_REFRESH_SECRET,
    );

    await saveRefreshToken(c, user.id, refreshToken);

    return c.json({
      user,
      token: accessToken,
    });
  },
);
authRouter.post(
  "/verify",
  async (c) => {
    const {
      id,
    } = c.get("jwtPayload");
    const prisma = c.get("prisma");
    const user = await prisma.users.findFirst({
      where: {
        id,
      },
    });

    return c.json(user);
  },
);

authRouter.post(
  "/refresh",
  zValidator("json", z.object({
    userId: z.string(),
  })),
  async (c) => {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];

    if (!accessToken) {
      return c.json({
        error: "No access token provided",
      }, 401);
    }

    const { payload } = decode(accessToken);
    const { id: userId } = payload as MyJWTPayload;

    const refreshToken = await getRefreshToken(c, userId);

    if (!refreshToken) {
      return c.json({
        error: "No refresh token provided",
      }, 401);
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateTokens(
      userId,
      c.env.JWT_ACCESS_SECRET,
      c.env.JWT_REFRESH_SECRET,
    );

    await saveRefreshToken(c, userId, newRefreshToken);

    return c.json({
      token: newAccessToken,
    });
  },
);

authRouter.post(
  "/logout",
  async (c) => {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];

    if (!accessToken) {
      return c.json({
        error: "No access token provided",
      }, 401);
    }

    const { payload } = decode(accessToken);
    const { id: userId } = payload as MyJWTPayload;

    await deleteRefreshToken(c, userId);
    c.status(204);
    return c.body(null);
  },
);

export default authRouter;
