import { z } from "zod";

export const GoalStatusSchema = z.enum(["draft", "submitted", "approved", "rejected", "active", "completed", "archived"]);
export const GoalPrioritySchema = z.enum(["low", "medium", "high"]);

export const createGoalSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be at most 200 characters"),
  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters")
    .optional(),
  status: GoalStatusSchema,
  priority: GoalPrioritySchema,
  targetDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Please enter a valid date",
    ),
  progress: z
    .number()
    .min(0, "Progress cannot be negative")
    .max(100, "Progress cannot exceed 100"),
});

export const updateGoalSchema = createGoalSchema.partial().extend({
  progress: z
    .number()
    .min(0, "Progress cannot be negative")
    .max(100, "Progress cannot exceed 100")
    .optional(),
});

export const goalIdSchema = z.object({
  id: z.string().min(1, "Goal ID is required"),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
