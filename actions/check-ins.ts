"use server";

import { revalidatePath } from "next/cache";

import { connectDB } from "@/lib/db";
import { getServerSession } from "@/lib/auth/session";
import { CheckInModel } from "@/models/check-in.model";
import { GoalModel } from "@/models/goal.model";
import { ROUTES } from "@/lib/constants";
import type { CheckIn } from "@/types/check-in";
import type { ActionResult } from "@/actions/goals";
import { createCheckInSchema, updateCheckInSchema } from "@/lib/validations/check-in";

export async function getMyCheckIns(year: number): Promise<ActionResult<CheckIn[]>> {
  try {
    const session = await getServerSession();
    if (!session) return { success: false, error: "Unauthorized" };

    await connectDB();
    
    // Fetch user's check-ins for the year
    const checkIns = await CheckInModel.find({ userId: session.uid, year })
      .sort({ quarter: 1 })
      .lean();

    // Fetch related goals to populate titles
    const goalIds = [...new Set(checkIns.map((c) => c.goalId))];
    const goals = await GoalModel.find({ _id: { $in: goalIds } }).lean();
    const goalMap = new Map(goals.map((g) => [String(g._id), g.title as string]));

    const data: CheckIn[] = checkIns.map((doc) => ({
      id: String(doc._id),
      userId: doc.userId as string,
      goalId: doc.goalId as string,
      goalTitle: goalMap.get(doc.goalId as string) || "Unknown Goal",
      quarter: doc.quarter as any,
      year: doc.year as number,
      plannedValue: doc.plannedValue as number,
      actualValue: doc.actualValue as number,
      status: doc.status as any,
      employeeComment: doc.employeeComment as string | undefined,
      managerComment: doc.managerComment as string | undefined,
      createdAt: doc.createdAt as any,
      updatedAt: doc.updatedAt as any,
    }));

    return { success: true, data };
  } catch (err) {
    console.error("[getMyCheckIns]", err);
    return { success: false, error: "Failed to fetch check-ins." };
  }
}

export async function createCheckIn(input: unknown): Promise<ActionResult<CheckIn>> {
  try {
    const session = await getServerSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const parsed = createCheckInSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    await connectDB();

    // Verify goal exists and belongs to user
    const goal = await GoalModel.findOne({ _id: parsed.data.goalId, userId: session.uid });
    if (!goal) {
      return { success: false, error: "Goal not found or access denied." };
    }

    // Ensure uniqueness of quarter + year for the goal
    const existing = await CheckInModel.findOne({
      userId: session.uid,
      goalId: parsed.data.goalId,
      year: parsed.data.year,
      quarter: parsed.data.quarter,
    });

    if (existing) {
      return { success: false, error: `Check-in already exists for ${parsed.data.quarter} ${parsed.data.year}` };
    }

    const newCheckIn = await CheckInModel.create({
      ...parsed.data,
      userId: session.uid,
    });

    // --- AUDIT LOG & NOTIFICATIONS ---
    const { createAuditLog, createNotification } = await import("@/lib/utils/audit");
    await createAuditLog({
      userId: session.uid,
      action: "create",
      entityType: "check_in",
      entityId: String(newCheckIn._id),
      newValue: newCheckIn.toObject(),
    });

    await createNotification({
      userId: session.uid,
      type: "check_in_submitted",
      title: "Quarterly Check-in Submitted",
      message: `Your ${parsed.data.quarter} ${parsed.data.year} check-in for goal "${goal.title}" was submitted successfully.`,
      link: "/dashboard/check-ins",
    });
    // -----------------

    // Optionally update goal progress based on latest check-in
    const progressPercent = Math.min(
      Math.round((parsed.data.actualValue / parsed.data.plannedValue) * 100),
      100
    );
    if (!isNaN(progressPercent) && isFinite(progressPercent)) {
      await GoalModel.findByIdAndUpdate(goal._id, { progress: progressPercent });
    }

    revalidatePath("/dashboard/check-ins");
    revalidatePath(ROUTES.goals);
    revalidatePath("/dashboard/progress");

    return { success: true, data: { ...newCheckIn.toObject(), id: String(newCheckIn._id) } as CheckIn };
  } catch (err: any) {
    console.error("[createCheckIn]", err);
    return { success: false, error: "Failed to create check-in." };
  }
}

export async function updateCheckIn(id: string, input: unknown): Promise<ActionResult<CheckIn>> {
  try {
    const session = await getServerSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const parsed = updateCheckInSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    await connectDB();

    const oldDoc = await CheckInModel.findOne({ _id: id, userId: session.uid }).lean();
    const doc = await CheckInModel.findOneAndUpdate(
      { _id: id, userId: session.uid },
      parsed.data,
      { new: true }
    );

    if (!doc) {
      return { success: false, error: "Check-in not found." };
    }

    // --- AUDIT LOG ---
    const { createAuditLog } = await import("@/lib/utils/audit");
    await createAuditLog({
      userId: session.uid,
      action: "update",
      entityType: "check_in",
      entityId: String(doc._id),
      previousValue: oldDoc as any,
      newValue: doc.toObject(),
    });
    // -----------------

    // Update goal progress if values changed
    if (parsed.data.actualValue !== undefined || parsed.data.plannedValue !== undefined) {
      const actual = parsed.data.actualValue ?? doc.actualValue;
      const planned = parsed.data.plannedValue ?? doc.plannedValue;
      const progressPercent = Math.min(Math.round((actual / planned) * 100), 100);
      
      if (!isNaN(progressPercent) && isFinite(progressPercent)) {
        await GoalModel.findByIdAndUpdate(doc.goalId, { progress: progressPercent });
      }
    }

    revalidatePath("/dashboard/check-ins");
    revalidatePath(ROUTES.goals);
    revalidatePath("/dashboard/progress");

    return { success: true, data: { ...doc.toObject(), id: String(doc._id) } as CheckIn };
  } catch (err) {
    console.error("[updateCheckIn]", err);
    return { success: false, error: "Failed to update check-in." };
  }
}

export async function deleteCheckIn(id: string): Promise<ActionResult> {
  try {
    const session = await getServerSession();
    if (!session) return { success: false, error: "Unauthorized" };

    await connectDB();

    const deleted = await CheckInModel.findOneAndDelete({ _id: id, userId: session.uid });
    if (!deleted) {
      return { success: false, error: "Check-in not found." };
    }

    revalidatePath("/dashboard/check-ins");

    return { success: true, data: undefined };
  } catch (err) {
    console.error("[deleteCheckIn]", err);
    return { success: false, error: "Failed to delete check-in." };
  }
}
