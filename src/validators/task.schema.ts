import { priority, stages } from "@prisma/client";
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(5).max(255),
  description: z.string().min(5).max(255).optional(),
  priority: z.nativeEnum(priority).optional(),
  parentTaskId: z.string().optional().nullable(),
  assigneeIds: z.array(z.string()).optional(),
  stage: z.nativeEnum(stages),
});

export const updateTaskSchema = createTaskSchema;
