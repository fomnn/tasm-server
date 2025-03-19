import { sign } from "hono/jwt";

export default async function generateJwtToken(userId: string, secret: string) {
  const payload = {
    id: userId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5, // Token expires in 5 minutes
  };

  const token = await sign(payload, secret);

  return token;
}
