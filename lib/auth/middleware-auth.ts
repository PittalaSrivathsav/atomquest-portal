import type { NextRequest } from "next/server";

import { AUTH_SESSION_COOKIE } from "@/lib/constants";

export function getSessionCookieFromRequest(
  request: NextRequest,
): string | undefined {
  return request.cookies.get(AUTH_SESSION_COOKIE)?.value;
}

/**
 * Verifies the Firebase session cookie. Must run in Node.js middleware
 * (firebase-admin is not Edge-compatible).
 */
export async function verifySessionInMiddleware(
  request: NextRequest,
): Promise<boolean> {
  const sessionCookie = getSessionCookieFromRequest(request);
  if (!sessionCookie) {
    return false;
  }

  const { isFirebaseAdminConfigured } = await import("@/lib/env/server");
  if (!isFirebaseAdminConfigured()) {
    return false;
  }

  try {
    const { getAdminAuth } = await import("@/lib/firebase/admin");
    await getAdminAuth().verifySessionCookie(sessionCookie, true);
    return true;
  } catch {
    return false;
  }
}
