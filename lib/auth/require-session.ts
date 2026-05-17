import { redirect } from "next/navigation";
import type { DecodedIdToken } from "firebase-admin/auth";

import { getServerSession } from "@/lib/auth/session";
import { ROUTES } from "@/lib/constants";

export async function requireSession(
  redirectPath?: string,
): Promise<DecodedIdToken> {
  const session = await getServerSession();

  if (!session) {
    const loginUrl = redirectPath
      ? `${ROUTES.login}?redirect=${encodeURIComponent(redirectPath)}`
      : ROUTES.login;
    redirect(loginUrl);
  }

  return session;
}
