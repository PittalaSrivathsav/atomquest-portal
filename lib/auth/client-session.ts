"use client";

import { AUTH_SESSION_COOKIE } from "@/lib/constants";

export async function createSession(idToken: string): Promise<void> {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(data?.error ?? "Failed to create session.");
  }
}

export async function destroySession(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE" });
}

/** Clears client-visible cookie name for debugging; session cookie is httpOnly. */
export const sessionCookieName = AUTH_SESSION_COOKIE;
