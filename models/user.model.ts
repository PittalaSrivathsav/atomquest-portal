import {
  type HydratedDocument,
  type InferSchemaType,
  Schema,
  model,
  models,
} from "mongoose";

import type { UserRole } from "@/types/user";

const USER_ROLES: UserRole[] = ["user", "manager", "admin"];

const UserSchema = new Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    photoURL: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "user",
    },
  },
  {
    timestamps: true,
    collection: "users",
  },
);

UserSchema.index({ email: 1 });

export type UserDocument = HydratedDocument<InferSchemaType<typeof UserSchema>>;

export const UserModel =
  models.User ?? model("User", UserSchema);
