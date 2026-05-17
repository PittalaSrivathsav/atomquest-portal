"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { destroySession } from "@/lib/auth/client-session";
import { ROUTES } from "@/lib/constants";
import { getClientAuth } from "@/lib/firebase/client";
import { isFirebaseClientConfigured } from "@/lib/env/client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    try {
      await destroySession();
      if (isFirebaseClientConfigured()) {
        await signOut(getClientAuth());
      }
      router.push(ROUTES.login);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={handleSignOut}
    >
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
