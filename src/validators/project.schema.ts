import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().max(55, "project name too long"),
  description: z.string().optional(),
});

export const updateProjectSchema = createProjectSchema;
