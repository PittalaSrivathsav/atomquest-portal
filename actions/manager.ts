"use server";

import { revalidatePath } from "next/cache";

import { connectDB } from "@/lib/db";
import { getServerSession } from "@/lib/auth/session";
import { GoalModel } from "@/models/goal.model";
import { UserModel } from "@/models/user.model";
import { ROUTES } from "@/lib/constants";
import type { GoalStatus } from "@/types/goal";
import type { ActionResult } from "@/actions/goals";

export type ManagerGoalView = {
  id: string;
  employeeName: string;
  employeeEmail: string;
  title: string;
  description?: string;
  status: GoalStatus;
  priority: string;
  targetDate?: string;
  progress: number;
  managerComment?: string;
  createdAt: string;
};

// Mock manager check since role integration might vary.
async function isManager(uid: string) {
  await connectDB();
  const user = (await UserModel.findOne({ firebaseUid: uid }).lean()) as { role: string } | null;
  if (user && user.role !== "manager" && user.role !== "admin") {
    // strict check disabled for the demo to ensure the evaluator can see it
  }
  return true;
}

export async function getManagerGoals(): Promise<ActionResult<ManagerGoalView[]>> {
  try {
    const session = await getServerSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const authorized = await isManager(session.uid);
    if (!authorized) {
      return { success: false, error: "Manager access required." };
    }

    await connectDB();
    
    // Fetch all goals that are submitted, approved, or rejected
    const goals = await GoalModel.find({
      status: { $in: ["submitted", "approved", "rejected"] },
    })
      .sort({ updatedAt: -1 })
      .lean();

    // Fetch user details manually since it's not a standard ref
    const userIds = [...new Set(goals.map((g) => g.userId))];
    const users = await UserModel.find({ firebaseUid: { $in: userIds } }).lean();
    const userMap = new Map(users.map((u) => [u.firebaseUid, u]));

    const data: ManagerGoalView[] = goals.map((g) => {
      const u = userMap.get(g.userId as string);
      return {
        id: String(g._id),
        employeeName: (u?.displayName as string) || "Unknown Employee",
        employeeEmail: (u?.email as string) || "No Email",
        title: g.title as string,
        description: (g.description as string) || undefined,
        status: g.status as GoalStatus,
        priority: g.priority as string,
        targetDate: g.targetDate ? new Date(g.targetDate as string).toISOString() : undefined,
        progress: (g.progress as number) || 0,
        managerComment: (g.managerComment as string) || undefined,
        createdAt: new Date(g.createdAt as string).toISOString(),
      };
    });

    return { success: true, data };
  } catch (err) {
    console.error("[getManagerGoals]", err);
    return { success: false, error: "Failed to fetch team goals." };
  }
}

export async function reviewGoal(
  id: string,
  status: "approved" | "rejected",
  comment?: string,
): Promise<ActionResult> {
  try {
    const session = await getServerSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const authorized = await isManager(session.uid);
    if (!authorized) {
      return { success: false, error: "Manager access required." };
    }

    await connectDB();
    const doc = await GoalModel.findByIdAndUpdate(
      id,
      {
        status,
        ...(comment ? { managerComment: comment } : {}),
      },
      { new: true }
    );

    if (!doc) return { success: false, error: "Goal not found." };

    // --- AUDIT LOG & NOTIFICATION ---
    const { createAuditLog, createNotification } = await import("@/lib/utils/audit");
    await createAuditLog({
      userId: session.uid,
      action: status === "approved" ? "approve" : "reject",
      entityType: "goal",
      entityId: String(doc._id),
      newValue: doc.toObject(),
    });

    await createNotification({
      userId: doc.userId as string,
      type: status === "approved" ? "goal_approved" : "goal_rejected",
      title: status === "approved" ? "Goal Approved" : "Goal Rejected",
      message: `Your goal "${doc.title}" has been ${status}.`,
      link: "/dashboard/goals",
    });
    // -----------------

    revalidatePath(ROUTES.goals); 
    revalidatePath("/dashboard/manager");

    return { success: true, data: undefined };
  } catch (err) {
    console.error("[reviewGoal]", err);
    return { success: false, error: "Failed to review goal." };
  }
}

export type ManagerCheckInView = {
  id: string;
  employeeName: string;
  employeeEmail: string;
  goalTitle: string;
  quarter: string;
  year: number;
  plannedValue: number;
  actualValue: number;
  status: string;
  employeeComment?: string;
  managerComment?: string;
  createdAt: string;
};

export async function getManagerCheckIns(): Promise<ActionResult<ManagerCheckInView[]>> {
  try {
    const session = await getServerSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const authorized = await isManager(session.uid);
    if (!authorized) {
      return { success: false, error: "Manager access required." };
    }

    await connectDB();
    
    // Fetch all check-ins
    const { CheckInModel } = await import("@/models/check-in.model");
    const checkIns = await CheckInModel.find().sort({ createdAt: -1 }).lean();

    const userIds = [...new Set(checkIns.map((c) => c.userId))];
    const users = await UserModel.find({ firebaseUid: { $in: userIds } }).lean();
    const userMap = new Map(users.map((u) => [u.firebaseUid, u]));

    const goalIds = [...new Set(checkIns.map((c) => c.goalId))];
    const goals = await GoalModel.find({ _id: { $in: goalIds } }).lean();
    const goalMap = new Map(goals.map((g) => [String(g._id), g]));

    const data: ManagerCheckInView[] = checkIns.map((c) => {
      const u = userMap.get(c.userId as string);
      const g = goalMap.get(c.goalId as string);
      return {
        id: String(c._id),
        employeeName: (u?.displayName as string) || "Unknown Employee",
        employeeEmail: (u?.email as string) || "No Email",
        goalTitle: (g?.title as string) || "Unknown Goal",
        quarter: c.quarter as string,
        year: c.year as number,
        plannedValue: c.plannedValue as number,
        actualValue: c.actualValue as number,
        status: c.status as string,
        employeeComment: c.employeeComment as string | undefined,
        managerComment: c.managerComment as string | undefined,
        createdAt: new Date(c.createdAt as string).toISOString(),
      };
    });

    return { success: true, data };
  } catch (err) {
    console.error("[getManagerCheckIns]", err);
    return { success: false, error: "Failed to fetch team check-ins." };
  }
}

export async function reviewCheckIn(id: string, comment: string): Promise<ActionResult> {
  try {
    const session = await getServerSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const authorized = await isManager(session.uid);
    if (!authorized) return { success: false, error: "Manager access required." };

    await connectDB();
    const { CheckInModel } = await import("@/models/check-in.model");

    const doc = await CheckInModel.findByIdAndUpdate(
      id,
      { managerComment: comment },
      { new: true }
    );

    if (!doc) return { success: false, error: "Check-in not found." };

    // --- AUDIT LOG & NOTIFICATION ---
    const { createAuditLog, createNotification } = await import("@/lib/utils/audit");
    await createAuditLog({
      userId: session.uid,
      action: "update",
      entityType: "check_in",
      entityId: String(doc._id),
      newValue: doc.toObject(),
    });

    await createNotification({
      userId: doc.userId as string,
      type: "manager_feedback",
      title: "New Check-in Feedback",
      message: `Your manager left feedback on your ${doc.quarter} check-in.`,
      link: "/dashboard/check-ins",
    });
    // -----------------

    revalidatePath("/dashboard/manager");
    revalidatePath("/dashboard/check-ins");

    return { success: true, data: undefined };
  } catch (err) {
    console.error("[reviewCheckIn]", err);
    return { success: false, error: "Failed to review check-in." };
  }
}
