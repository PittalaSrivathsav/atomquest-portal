import { connectDB } from "@/lib/db";
import { AuditLogModel } from "@/models/audit-log.model";
import { NotificationModel } from "@/models/notification.model";
import { UserModel } from "@/models/user.model";
import type { AuditAction, AuditEntityType } from "@/types/audit-log";
import type { NotificationType } from "@/types/notification";

export async function createAuditLog(params: {
  userId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  previousValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
}) {
  try {
    await connectDB();
    await AuditLogModel.create(params);
  } catch (err) {
    console.error("[createAuditLog] Error logging audit:", err);
  }
}

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  try {
    await connectDB();
    await NotificationModel.create(params);
  } catch (err) {
    console.error("[createNotification] Error creating notification:", err);
  }
}

/** Notify all managers when an employee submits a goal for review. */
export async function notifyManagersAboutSubmission(
  employeeName: string,
  goalId: string,
) {
  try {
    await connectDB();
    const managers = await UserModel.find({ role: "manager" }).lean();
    await Promise.all(
      managers.map((manager) =>
        createNotification({
          userId: manager.firebaseUid as string,
          type: "goal_submitted",
          title: "New Goal Submitted for Review",
          message: `${employeeName} has submitted a goal for your review.`,
          link: "/dashboard/manager",
        }),
      ),
    );
  } catch (err) {
    console.error("[notifyManagersAboutSubmission] Error:", err);
  }
}
