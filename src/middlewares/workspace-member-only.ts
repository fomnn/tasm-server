import type { Context, Next } from "hono";
import factory from "../helpers/hono";

export const workspaceMemberOnly = factory.createMiddleware(async (c: Context, next: Next) => {
  const prisma = c.get("prisma");
  const { id: userId } = c.get("jwtPayload");
  const workspaceId = c.req.param("workspaceId");

  const workspace = await prisma.workspaceMembers.findFirst({
    where: {
      workspaceId,
      userId,
    },
  });

  if (!workspace) {
    return c.json({
      error: "You are not a member of this workspace",
    }, 403);
  }

  await next();
});
