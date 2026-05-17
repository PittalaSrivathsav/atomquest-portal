import { z } from "zod";

import {
  firebaseAdminEnvSchema,
  firebaseClientEnvSchema,
  mongoEnvSchema,
} from "@/lib/env/schema";

export type EnvFeature = "mongodb" | "firebase_client" | "firebase_admin";

export type EnvCheckResult = {
  feature: EnvFeature;
  label: string;
  configured: boolean;
  missingKeys: string[];
};

function checkGroup(
  feature: EnvFeature,
  label: string,
  keys: string[],
  schema: z.ZodType,
  read: () => Record<string, string | undefined>,
): EnvCheckResult {
  const values = read();
  const parsed = schema.safeParse(values);
  const missingKeys = keys.filter((key) => !values[key]?.trim());

  return {
    feature,
    label,
    configured: parsed.success,
    missingKeys: parsed.success ? [] : missingKeys,
  };
}

export function checkEnvFeatures(): EnvCheckResult[] {
  return [
    checkGroup("mongodb", "MongoDB Atlas", ["MONGODB_URI"], mongoEnvSchema, () => ({
      MONGODB_URI: process.env.MONGODB_URI,
    })),
    checkGroup(
      "firebase_client",
      "Firebase (client)",
      [
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "NEXT_PUBLIC_FIREBASE_APP_ID",
      ],
      firebaseClientEnvSchema,
      () => ({
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
      }),
    ),
    checkGroup(
      "firebase_admin",
      "Firebase (admin)",
      [
        "FIREBASE_ADMIN_PROJECT_ID",
        "FIREBASE_ADMIN_CLIENT_EMAIL",
        "FIREBASE_ADMIN_PRIVATE_KEY",
      ],
      firebaseAdminEnvSchema,
      () => ({
        FIREBASE_ADMIN_PROJECT_ID: process.env.FIREBASE_ADMIN_PROJECT_ID,
        FIREBASE_ADMIN_CLIENT_EMAIL: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        FIREBASE_ADMIN_PRIVATE_KEY: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
      }),
    ),
  ];
}

export function logEnvStatus(): void {
  if (process.env.SKIP_ENV_VALIDATION === "true") {
    return;
  }

  const results = checkEnvFeatures();
  const incomplete = results.filter((result) => !result.configured);

  if (incomplete.length === 0) {
    console.info("[atomquest] Environment: all feature groups configured.");
    return;
  }

  console.warn(
    "[atomquest] Environment: incomplete configuration (.env.local):",
  );
  for (const result of incomplete) {
    console.warn(
      `  - ${result.label}: missing or invalid → ${result.missingKeys.join(", ") || "see .env.example"}`,
    );
  }
  console.warn(
    "[atomquest] Copy .env.example to .env.local and fill in values. Set SKIP_ENV_VALIDATION=true to silence.",
  );
}

export function assertEnvForFeatures(features: EnvFeature[]): void {
  const results = checkEnvFeatures();
  const byFeature = Object.fromEntries(
    results.map((result) => [result.feature, result]),
  ) as Record<EnvFeature, EnvCheckResult>;

  const missing = features.filter((feature) => !byFeature[feature]?.configured);
  if (missing.length > 0) {
    const labels = missing
      .map((feature) => byFeature[feature]?.label ?? feature)
      .join(", ");
    throw new Error(
      `Required environment not configured for: ${labels}. See .env.example.`,
    );
  }
}
