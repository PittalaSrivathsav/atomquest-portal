import {
  firebaseClientEnvSchema,
  type FirebaseClientEnv,
} from "@/lib/env/schema";

function readFirebaseClientEnv() {
  return {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

export function isFirebaseClientConfigured(): boolean {
  return firebaseClientEnvSchema.safeParse(readFirebaseClientEnv()).success;
}

export function getFirebaseClientConfig():
  | FirebaseClientEnv
  | null {
  const result = firebaseClientEnvSchema.safeParse(readFirebaseClientEnv());
  return result.success ? result.data : null;
}

/** Maps validated env to the shape expected by the Firebase JS SDK. */
export function getFirebaseClientSdkConfig() {
  const env = getFirebaseClientConfig();
  if (!env) {
    return null;
  }

  return {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}
