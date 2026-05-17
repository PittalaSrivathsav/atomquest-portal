"use server";

import { revalidatePath } from "next/cache";

import { connectDB } from "@/lib/db";
import { getServerSession } from "@/lib/auth/session";
import { NotificationModel } from "@/models/notification.model";
import type { AppNotification } from "@/types/notification";
import type { ActionResult } from "@/actions/goals";

export async function getNotifications(): Promise<ActionResult<AppNotification[]>> {
  try {
    const session = await getServerSession();
    if (!session) return { success: false, error: "Unauthorized" };

    await connectDB();
    const docs = await NotificationModel.find({ userId: session.uid })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const data: AppNotification[] = docs.map((d) => ({
      id: String(d._id),
      userId: d.userId as string,
      type: d.type as AppNotification["type"],
      title: d.title as string,
      message: d.message as string,
      isRead: d.isRead as boolean,
      link: d.link as string | undefined,
      createdAt: new Date(d.createdAt as string).toISOString(),
    }));

    return { success: true, data };
  } catch (err) {
    console.error("[getNotifications]", err);
    return { success: false, error: "Failed to fetch notifications." };
  }
}

export async function markNotificationAsRead(id: string): Promise<ActionResult> {
  try {
    const session = await getServerSession();
    if (!session) return { success: false, error: "Unauthorized" };

    await connectDB();
    await NotificationModel.findOneAndUpdate(
      { _id: id, userId: session.uid },
      { isRead: true }
    );

    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (err) {
    console.error("[markNotificationAsRead]", err);
    return { success: false, error: "Failed to mark as read." };
  }
}

export async function markAllNotificationsAsRead(): Promise<ActionResult> {
  try {
    const session = await getServerSession();
    if (!session) return { success: false, error: "Unauthorized" };

    await connectDB();
    await NotificationModel.updateMany(
      { userId: session.uid, isRead: false },
      { isRead: true }
    );

    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (err) {
    console.error("[markAllNotificationsAsRead]", err);
    return { success: false, error: "Failed to mark all as read." };
  }
}
