import type { Context } from "hono";
import type { ENV } from "./hono";

export async function saveRefreshToken(ctx: Context<ENV>, userId: string, token: string) {
  await ctx.env.tasm_kv.put(`refresh_token:${userId}`, token);
}

export async function getRefreshToken(ctx: Context<ENV>, userId: string) {
  return await ctx.env.tasm_kv.get(`refresh_token:${userId}`);
}

export async function deleteRefreshToken(ctx: Context<ENV>, userId: string) {
  await ctx.env.tasm_kv.delete(`refresh_token:${userId}`);
}
