import type { DecodedIdToken } from "firebase-admin/auth";

import { connectDB } from "@/lib/db";
import { UserModel } from "@/models";

export async function syncUserFromToken(decoded: DecodedIdToken) {
  if (!decoded.email) {
    throw new Error("Authenticated user must have an email address.");
  }

  await connectDB();

  await UserModel.findOneAndUpdate(
    { firebaseUid: decoded.uid },
    {
      firebaseUid: decoded.uid,
      email: decoded.email,
      displayName: decoded.name ?? undefined,
      photoURL: decoded.picture ?? undefined,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}
