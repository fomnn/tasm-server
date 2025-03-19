import { zValidator } from "@hono/zod-validator";
import { jwt } from "hono/jwt";
import createRouter from "../lib/hono";
import generateJwtToken from "../utils/generate-jwt-token";
import { loginSchema, signupSchema } from "../validators/auth-schemas";

const authRouter = createRouter().basePath("/auth");

authRouter.use("/verify", (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
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

    const isPasswordValid = user.password === password;

    if (!isPasswordValid) {
      return c.json({
        error: "Invalid password",
      }, 401);
    }

    const token = await generateJwtToken(user.id, c.env.JWT_SECRET);

    return c.json({
      user,
      token,
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
        password,
        Profile: {
          create: {
            name,
            username,
            email,
          },
        },
      },
    });

    const token = await generateJwtToken(user.id, c.env.JWT_SECRET);

    return c.json({
      user,
      token,
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

    return c.json({
      user,
    });
  },
);

export default authRouter;
