import { Role } from "@prisma/client";
import { z } from "zod";

export const createWorkspaceMemberSchema = z.object({
  userId: z.string(),
  role: z.nativeEnum(Role),
});

export const updateWorkspaceMemberSchema = z.object({
  role: z.nativeEnum(Role),
});
