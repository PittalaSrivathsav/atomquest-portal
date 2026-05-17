export type GoalStatus = "draft" | "submitted" | "approved" | "rejected" | "active" | "completed" | "archived";

export type GoalPriority = "low" | "medium" | "high";

export type Goal = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: GoalStatus;
  priority: GoalPriority;
  targetDate?: Date;
  progress: number;
  managerComment?: string;
  createdAt: Date;
  updatedAt: Date;
};
