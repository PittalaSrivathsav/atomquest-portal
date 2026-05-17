import {
  type HydratedDocument,
  type InferSchemaType,
  Schema,
  model,
  models,
} from "mongoose";

import type { Quarter, CheckInStatus } from "@/types/check-in";

const QUARTERS: Quarter[] = ["Q1", "Q2", "Q3", "Q4"];
const CHECK_IN_STATUSES: CheckInStatus[] = ["not_started", "on_track", "completed"];

const CheckInSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    goalId: {
      type: String,
      required: true,
      index: true,
    },
    quarter: {
      type: String,
      enum: QUARTERS,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    plannedValue: {
      type: Number,
      required: true,
      min: 0,
    },
    actualValue: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: CHECK_IN_STATUSES,
      default: "not_started",
    },
    employeeComment: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    managerComment: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
    collection: "checkins",
  },
);

CheckInSchema.index({ userId: 1, goalId: 1, year: 1, quarter: 1 }, { unique: true });

export type CheckInDocument = HydratedDocument<InferSchemaType<typeof CheckInSchema>>;

export const CheckInModel =
  models.CheckIn ?? model("CheckIn", CheckInSchema);
