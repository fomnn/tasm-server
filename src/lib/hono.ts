import type { PrismaClient } from "@prisma/client";
import type { JwtVariables } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";
import { Hono } from "hono";
import { usePrisma } from "./prisma";

interface MyJWTPayload extends JWTPayload {
  id: string;
}

interface Variables extends JwtVariables<MyJWTPayload> {
  prisma: PrismaClient;
}

export default function createRouter() {
  const router = new Hono<{ Bindings: CloudflareBindings; Variables: Variables }>();
  router.use(async (c, next) => {
    c.set("prisma", usePrisma(c.env.DB));
    await next();
  });
  return router;
}
