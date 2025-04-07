import { sign } from "hono/jwt";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export async function generateTokens(userId: string, accessSecret: string, refreshSecret: string): Promise<TokenPair> {
  const accessPayload = {
    id: userId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 5, // Access token expires in 15 minutes
  };

  const refreshPayload = {
    id: userId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // Refresh token expires in 7 days
  };

  const accessToken = await sign(accessPayload, accessSecret);
  const refreshToken = await sign(refreshPayload, refreshSecret);

  return {
    accessToken,
    refreshToken,
  };
}
