import { z } from "zod";

export const QuarterSchema = z.enum(["Q1", "Q2", "Q3", "Q4"]);
export const CheckInStatusSchema = z.enum(["not_started", "on_track", "completed"]);

export const createCheckInSchema = z.object({
  goalId: z.string().min(1, "Goal is required"),
  quarter: QuarterSchema,
  year: z.number().int().min(2000).max(2100),
  plannedValue: z.number().min(0, "Planned value must be non-negative"),
  actualValue: z.number().min(0, "Actual value must be non-negative"),
  status: CheckInStatusSchema,
  employeeComment: z
    .string()
    .max(2000, "Comment must be at most 2000 characters")
    .optional(),
});

export const updateCheckInSchema = createCheckInSchema.partial().extend({
  goalId: z.string().min(1).optional(),
});

export type CreateCheckInInput = z.infer<typeof createCheckInSchema>;
export type UpdateCheckInInput = z.infer<typeof updateCheckInSchema>;
