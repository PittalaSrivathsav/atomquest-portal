"use server";

import { connectDB } from "@/lib/db";
import { getServerSession } from "@/lib/auth/session";
import { AuditLogModel } from "@/models/audit-log.model";
import { UserModel } from "@/models/user.model";
import { GoalModel } from "@/models/goal.model";
import { isAdmin } from "@/actions/admin";
import type { ActionResult } from "@/actions/goals";
import type { AuditLog } from "@/types/audit-log";

export type AuditLogFilters = {
  userId?: string;
  action?: string;
  entityType?: string;
  date?: string;
};

export async function getAuditLogs(filters: AuditLogFilters = {}): Promise<ActionResult<{ logs: AuditLog[], users: { id: string, name: string }[] }>> {
  try {
    const session = await getServerSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const authorized = await isAdmin(session.uid);
    if (!authorized) return { success: false, error: "Admin access required." };

    await connectDB();

    const query: Record<string, any> = {};
    if (filters.userId && filters.userId !== "all") query.userId = filters.userId;
    if (filters.action && filters.action !== "all") query.action = filters.action;
    if (filters.entityType && filters.entityType !== "all") query.entityType = filters.entityType;
    if (filters.date && filters.date !== "all") {
      const now = new Date();
      if (filters.date === "today") {
        now.setHours(0, 0, 0, 0);
        query.createdAt = { $gte: now };
      } else if (filters.date === "7days") {
        now.setDate(now.getDate() - 7);
        query.createdAt = { $gte: now };
      } else if (filters.date === "30days") {
        now.setDate(now.getDate() - 30);
        query.createdAt = { $gte: now };
      }
    }

    const docs = await AuditLogModel.find(query).sort({ createdAt: -1 }).limit(200).lean();

    // Fetch related users
    const allUsers = await UserModel.find().lean();
    const userMap = new Map(allUsers.map(u => [u.firebaseUid, u]));
    
    // Fetch related goals for title
    const goalIds = [...new Set(docs.filter(d => d.entityType === "goal").map(d => d.entityId))];
    const goals = await GoalModel.find({ _id: { $in: goalIds } }).lean();
    const goalMap = new Map(goals.map(g => [String(g._id), g]));

    const logs: AuditLog[] = docs.map((d) => {
      const u = userMap.get(d.userId as string);
      let entityTitle;
      if (d.entityType === "goal") {
        entityTitle = goalMap.get(d.entityId as string)?.title as string | undefined;
      }

      return {
        id: String(d._id),
        userId: d.userId as string,
        userName: (u?.displayName as string) || "Unknown User",
        userEmail: u?.email as string | undefined,
        action: d.action as any,
        entityType: d.entityType as any,
        entityId: d.entityId as string,
        entityTitle,
        previousValue: d.previousValue as Record<string, any> | undefined,
        newValue: d.newValue as Record<string, any> | undefined,
        createdAt: new Date(d.createdAt as string).toISOString(),
      };
    });

    const users = allUsers.map(u => ({
      id: u.firebaseUid as string,
      name: (u.displayName as string) || (u.email as string)
    }));

    return { success: true, data: { logs, users } };
  } catch (err) {
    console.error("[getAuditLogs]", err);
    return { success: false, error: "Failed to fetch audit logs." };
  }
}
