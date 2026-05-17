export type NotificationType =
  | "goal_created"
  | "goal_updated"
  | "goal_deleted"
  | "goal_submitted"
  | "goal_approved"
  | "goal_rejected"
  | "check_in_submitted"
  | "manager_feedback"
  | "check_in_reminder"
  | "system";

export type AppNotification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
};
