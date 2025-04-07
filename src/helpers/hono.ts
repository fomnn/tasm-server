import type { PrismaClient } from "@prisma/client";
import type { JwtVariables } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";
import { createFactory } from "hono/factory";
import { usePrisma } from "./prisma";

export type MyJWTPayload = JWTPayload & {
  id: string;
};

interface Variables extends JwtVariables<MyJWTPayload> {
  prisma: PrismaClient;
}

export interface ENV { Bindings: CloudflareBindings; Variables: Variables }

const factory = createFactory<ENV>({
  initApp: (app) => {
    app.use(async (c, next) => {
      c.set("prisma", usePrisma(c.env.DB));
      await next();
    });
  },
});

export function createRouter() {
  return factory.createApp();
}

export default factory;
