import { cookies } from "next/headers";
import type { DecodedIdToken } from "firebase-admin/auth";

import { AUTH_SESSION_COOKIE } from "@/lib/constants";
import { getAdminAuth } from "@/lib/firebase/admin";
import { isFirebaseAdminConfigured } from "@/lib/env/server";

export async function getServerSession(): Promise<DecodedIdToken | null> {
  if (!isFirebaseAdminConfigured()) {
    return null;
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    return await getAdminAuth().verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}
