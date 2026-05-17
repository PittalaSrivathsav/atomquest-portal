import {
  firebaseAdminEnvSchema,
  mongoEnvSchema,
  type FirebaseAdminEnv,
  type MongoEnv,
} from "@/lib/env/schema";

function readFirebaseAdminEnv() {
  return {
    FIREBASE_ADMIN_PROJECT_ID: process.env.FIREBASE_ADMIN_PROJECT_ID,
    FIREBASE_ADMIN_CLIENT_EMAIL: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    FIREBASE_ADMIN_PRIVATE_KEY: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  };
}

function readMongoEnv() {
  return {
    MONGODB_URI: process.env.MONGODB_URI,
  };
}

export function isDbConfigured(): boolean {
  return mongoEnvSchema.safeParse(readMongoEnv()).success;
}

export function isFirebaseAdminConfigured(): boolean {
  return firebaseAdminEnvSchema.safeParse(readFirebaseAdminEnv()).success;
}

export function getMongoEnv(): MongoEnv {
  const result = mongoEnvSchema.safeParse(readMongoEnv());
  if (!result.success) {
    throw new Error(
      "MONGODB_URI is missing or invalid. Copy .env.example to .env.local and set your Atlas connection string.",
    );
  }
  return result.data;
}

export function getFirebaseAdminEnv(): FirebaseAdminEnv {
  const result = firebaseAdminEnvSchema.safeParse(readFirebaseAdminEnv());
  if (!result.success) {
    throw new Error(
      "Firebase Admin env is missing or invalid. Set FIREBASE_ADMIN_* in .env.local (see .env.example).",
    );
  }
  return result.data;
}

export function getFirebaseAdminCredential() {
  const env = getFirebaseAdminEnv();
  return {
    projectId: env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
  };
}

export function getAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
