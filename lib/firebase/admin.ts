import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

import {
  getFirebaseAdminCredential,
  isFirebaseAdminConfigured,
} from "@/lib/env/server";

let adminApp: App | undefined;

function getAdminApp(): App {
  if (!isFirebaseAdminConfigured()) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_ADMIN_* in .env.local.",
    );
  }

  if (!adminApp) {
    const existing = getApps();
    adminApp =
      existing.length > 0
        ? existing[0]!
        : initializeApp({
            credential: cert(getFirebaseAdminCredential()),
          });
  }

  return adminApp;
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}
