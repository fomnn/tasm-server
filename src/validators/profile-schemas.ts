import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z.string().min(3).max(255),
  bio: z.string().max(255),
  name: z.string().max(255),
});
