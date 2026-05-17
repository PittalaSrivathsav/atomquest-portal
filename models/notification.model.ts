import {
  type HydratedDocument,
  type InferSchemaType,
  Schema,
  model,
  models,
} from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "goal_created",
        "goal_updated",
        "goal_deleted",
        "goal_submitted",
        "goal_approved",
        "goal_rejected",
        "check_in_submitted",
        "manager_feedback",
        "check_in_reminder",
        "system",
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    link: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "notifications",
  },
);

export type NotificationDocument = HydratedDocument<InferSchemaType<typeof NotificationSchema>>;

export const NotificationModel =
  models.Notification ?? model("Notification", NotificationSchema);
