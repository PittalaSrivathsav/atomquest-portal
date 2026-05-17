import { z } from "zod";

export const firebaseClientEnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
});

export const firebaseAdminEnvSchema = z.object({
  FIREBASE_ADMIN_PROJECT_ID: z.string().min(1),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().email(),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1),
});

export const mongoEnvSchema = z.object({
  MONGODB_URI: z
    .string()
    .min(1)
    .refine(
      (value) =>
        value.startsWith("mongodb://") || value.startsWith("mongodb+srv://"),
      "MONGODB_URI must start with mongodb:// or mongodb+srv://",
    ),
});

export const appEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  SKIP_ENV_VALIDATION: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});

export type FirebaseClientEnv = z.infer<typeof firebaseClientEnvSchema>;
export type FirebaseAdminEnv = z.infer<typeof firebaseAdminEnvSchema>;
export type MongoEnv = z.infer<typeof mongoEnvSchema>;
