"use server";

import { revalidatePath } from "next/cache";

import { connectDB } from "@/lib/db";
import { getServerSession } from "@/lib/auth/session";
import { GoalModel } from "@/models/goal.model";
import {
  createGoalSchema,
  updateGoalSchema,
  goalIdSchema,
  type CreateGoalInput,
  type UpdateGoalInput,
} from "@/lib/validations/goal";
import type { Goal } from "@/types/goal";
import { ROUTES } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Serialisation helper — converts a Mongoose document to a plain Goal object
// ---------------------------------------------------------------------------
function toGoal(doc: Record<string, unknown>): Goal {
  return {
    id: String(doc._id),
    userId: doc.userId as string,
    title: doc.title as string,
    description: (doc.description as string | undefined) ?? undefined,
    status: doc.status as Goal["status"],
    priority: doc.priority as Goal["priority"],
    targetDate: doc.targetDate ? new Date(doc.targetDate as string) : undefined,
    progress: (doc.progress as number) ?? 0,
    createdAt: new Date(doc.createdAt as string),
    updatedAt: new Date(doc.updatedAt as string),
  };
}

// ---------------------------------------------------------------------------
// Action result type — used instead of throwing so callers can discriminate
// ---------------------------------------------------------------------------
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// LIST — fetch all goals for the authenticated user
// ---------------------------------------------------------------------------
export async function getGoals(): Promise<ActionResult<Goal[]>> {
  try {
    const session = await getServerSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    await connectDB();
    const docs = await GoalModel.find({ userId: session.uid })
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      data: docs.map((d) => toGoal(d as Record<string, unknown>)),
    };
  } catch (err) {
    console.error("[getGoals]", err);
    return { success: false, error: "Failed to fetch goals." };
  }
}

// ---------------------------------------------------------------------------
// GET ONE
// ---------------------------------------------------------------------------
export async function getGoalById(id: string): Promise<ActionResult<Goal>> {
  try {
    const session = await getServerSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const parsed = goalIdSchema.safeParse({ id });
    if (!parsed.success) return { success: false, error: "Invalid goal ID." };

    await connectDB();
    const doc = await GoalModel.findOne({
      _id: id,
      userId: session.uid,
    }).lean();

    if (!doc) return { success: false, error: "Goal not found." };

    return {
      success: true,
      data: toGoal(doc as Record<string, unknown>),
    };
  } catch (err) {
    console.error("[getGoalById]", err);
    return { success: false, error: "Failed to fetch goal." };
  }
}

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------
export async function createGoal(
  input: CreateGoalInput,
): Promise<ActionResult<Goal>> {
  try {
    const session = await getServerSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const parsed = createGoalSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message ?? "Validation failed.",
      };
    }

    const { title, description, status, priority, targetDate, progress } =
      parsed.data;

    await connectDB();
    const doc = await GoalModel.create({
      userId: session.uid,
      title,
      description,
      status,
      priority,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      progress,
    });

    // --- AUDIT LOG & NOTIFICATIONS ---
    const { createAuditLog, createNotification, notifyManagersAboutSubmission } =
      await import("@/lib/utils/audit");

    const isSubmit = status === "submitted";
    await createAuditLog({
      userId: session.uid,
      action: isSubmit ? "submit" : "create",
      entityType: "goal",
      entityId: String(doc._id),
      newValue: doc.toObject(),
    });

    // Notify the creator
    await createNotification({
      userId: session.uid,
      type: isSubmit ? "goal_submitted" : "goal_created",
      title: isSubmit ? "Goal Submitted for Review" : "Goal Created",
      message: isSubmit
        ? `Your goal "${doc.title}" has been submitted for manager review.`
        : `Your goal "${doc.title}" was created successfully.`,
      link: "/dashboard/goals",
    });

    if (isSubmit) {
      const { UserModel } = await import("@/models/user.model");
      const user = await UserModel.findOne({ firebaseUid: session.uid });
      await notifyManagersAboutSubmission(
        user?.displayName || "An employee",
        String(doc._id),
      );
    }
    // -----------------

    revalidatePath(ROUTES.goals);

    return {
      success: true,
      data: toGoal(doc.toObject() as Record<string, unknown>),
    };
  } catch (err) {
    console.error("[createGoal]", err);
    return { success: false, error: "Failed to create goal." };
  }
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------
export async function updateGoal(
  id: string,
  input: UpdateGoalInput,
): Promise<ActionResult<Goal>> {
  try {
    const session = await getServerSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const parsed = updateGoalSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message ?? "Validation failed.",
      };
    }

    const updates: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.targetDate !== undefined) {
      updates.targetDate = parsed.data.targetDate
        ? new Date(parsed.data.targetDate)
        : null;
    }

    await connectDB();
    const oldDoc = await GoalModel.findOne({ _id: id, userId: session.uid }).lean();
    
    const doc = await GoalModel.findOneAndUpdate(
      { _id: id, userId: session.uid },
      updates,
      { new: true, runValidators: true },
    );

    if (!doc) {
      return { success: false, error: "Goal not found." };
    }

    // --- AUDIT LOG & NOTIFICATIONS ---
    const { createAuditLog, createNotification, notifyManagersAboutSubmission } =
      await import("@/lib/utils/audit");
    const isNowSubmitted =
      parsed.data.status === "submitted" && (oldDoc as Record<string, unknown>)?.status !== "submitted";

    await createAuditLog({
      userId: session.uid,
      action: isNowSubmitted ? "submit" : "update",
      entityType: "goal",
      entityId: String(doc._id),
      previousValue: oldDoc as any,
      newValue: doc.toObject(),
    });

    // Notify the owner
    await createNotification({
      userId: session.uid,
      type: isNowSubmitted ? "goal_submitted" : "goal_updated",
      title: isNowSubmitted ? "Goal Submitted for Review" : "Goal Updated",
      message: isNowSubmitted
        ? `Your goal "${doc.title}" has been submitted for manager review.`
        : `Your goal "${doc.title}" was updated successfully.`,
      link: "/dashboard/goals",
    });

    if (isNowSubmitted) {
      const { UserModel } = await import("@/models/user.model");
      const user = await UserModel.findOne({ firebaseUid: session.uid });
      await notifyManagersAboutSubmission(
        user?.displayName || "An employee",
        String(doc._id),
      );
    }
    // -----------------

    revalidatePath(ROUTES.goals);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/progress");

    return {
      success: true,
      data: toGoal(doc.toObject() as Record<string, unknown>),
    };
  } catch (err) {
    console.error("[updateGoal]", err);
    return { success: false, error: "Failed to update goal." };
  }
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------
export async function deleteGoal(id: string): Promise<ActionResult> {
  try {
    const session = await getServerSession();
    if (!session) return { success: false, error: "Unauthorized" };

    await connectDB();
    const deleted = await GoalModel.findOneAndDelete({
      _id: id,
      userId: session.uid,
    });

    if (!deleted) {
      return { success: false, error: "Goal not found." };
    }

    // --- AUDIT LOG & NOTIFICATIONS ---
    const { createAuditLog, createNotification } = await import("@/lib/utils/audit");
    await createAuditLog({
      userId: session.uid,
      action: "delete",
      entityType: "goal",
      entityId: id,
      previousValue: deleted.toObject(),
    });

    await createNotification({
      userId: session.uid,
      type: "goal_deleted",
      title: "Goal Deleted",
      message: `Your goal "${deleted.title}" has been permanently deleted.`,
      link: "/dashboard/goals",
    });
    // -----------------

    revalidatePath(ROUTES.goals);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/progress");

    return { success: true, data: undefined };
  } catch (err) {
    console.error("[deleteGoal]", err);
    return { success: false, error: "Failed to delete goal." };
  }
}
