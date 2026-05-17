import {
  type HydratedDocument,
  type InferSchemaType,
  Schema,
  model,
  models,
} from "mongoose";

import type { GoalPriority, GoalStatus } from "@/types/goal";

const GOAL_STATUSES: GoalStatus[] = [
  "draft",
  "submitted",
  "approved",
  "rejected",
  "active",
  "completed",
  "archived",
];

const GOAL_PRIORITIES: GoalPriority[] = ["low", "medium", "high"];

const GoalSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: GOAL_STATUSES,
      default: "draft",
      index: true,
    },
    priority: {
      type: String,
      enum: GOAL_PRIORITIES,
      default: "medium",
    },
    targetDate: {
      type: Date,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    managerComment: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
    collection: "goals",
  },
);

GoalSchema.index({ userId: 1, status: 1 });
GoalSchema.index({ userId: 1, createdAt: -1 });

export type GoalDocument = HydratedDocument<InferSchemaType<typeof GoalSchema>>;

export const GoalModel =
  models.Goal ?? model("Goal", GoalSchema);
