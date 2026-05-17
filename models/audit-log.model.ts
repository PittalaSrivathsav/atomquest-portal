import {
  type HydratedDocument,
  type InferSchemaType,
  Schema,
  model,
  models,
} from "mongoose";

const AuditLogSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: ["create", "update", "delete", "approve", "reject", "submit"],
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: ["goal", "check_in"],
      index: true,
    },
    entityId: {
      type: String,
      required: true,
      index: true,
    },
    previousValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "auditlogs",
  },
);

AuditLogSchema.index({ createdAt: -1 });

export type AuditLogDocument = HydratedDocument<InferSchemaType<typeof AuditLogSchema>>;

export const AuditLogModel = models.AuditLog ?? model("AuditLog", AuditLogSchema);
