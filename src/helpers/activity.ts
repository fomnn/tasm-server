import type { Context } from "hono";
import type { ENV } from "./hono";

interface ActivityData {
  title: string;
  workspaceId: string;
  description?: string;
  userId: string;
}

export async function createActivity(ctx: Context<ENV>, data: ActivityData) {
  const prisma = ctx.get("prisma");

  await prisma.activities.create({
    data: {
      title: data.title,
      workspaceId: data.workspaceId,
      description: data.description,
      userId: data.userId,
    },
  });
}
