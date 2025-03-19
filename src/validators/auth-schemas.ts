import { z } from "zod";

export const signupSchema = z.object({
  username: z.string().min(3).max(25),
  name: z.string().min(3).max(55),
  email: z.string().email(),
  password: z.string().min(4).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4).max(100),
});
