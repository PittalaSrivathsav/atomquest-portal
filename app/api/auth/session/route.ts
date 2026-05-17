import { NextResponse } from "next/server";

import { AUTH_SESSION_COOKIE } from "@/lib/constants";
import { syncUserFromToken } from "@/lib/auth/sync-user";
import { getAdminAuth } from "@/lib/firebase/admin";
import { isFirebaseAdminConfigured } from "@/lib/env/server";

const SESSION_EXPIRES_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_EXPIRES_MS / 1000,
  };
}

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Firebase Admin is not configured on the server." },
      { status: 503 },
    );
  }

  let idToken: string | undefined;

  try {
    const body = (await request.json()) as { idToken?: string };
    idToken = body.idToken;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!idToken) {
    return NextResponse.json({ error: "Missing idToken." }, { status: 400 });
  }

  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_MS,
    });

    await syncUserFromToken(decoded);

    const response = NextResponse.json({ status: "ok" });
    response.cookies.set(AUTH_SESSION_COOKIE, sessionCookie, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("[auth/session] Failed to create session:", error);
    return NextResponse.json(
      { error: "Invalid or expired credentials." },
      { status: 401 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ status: "ok" });

  if (!isFirebaseAdminConfigured()) {
    response.cookies.delete(AUTH_SESSION_COOKIE);
    return response;
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

  if (sessionCookie) {
    try {
      const adminAuth = getAdminAuth();
      const decoded = await adminAuth.verifySessionCookie(sessionCookie);
      await adminAuth.revokeRefreshTokens(decoded.uid);
    } catch {
      // Cookie invalid or expired — still clear it.
    }
  }

  response.cookies.delete(AUTH_SESSION_COOKIE);
  return response;
}
