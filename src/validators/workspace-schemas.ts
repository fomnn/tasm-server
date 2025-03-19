import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(255),
});

export const updateWorkspaceSchema = createWorkspaceSchema;
