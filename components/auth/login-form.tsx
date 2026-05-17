"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import { siteConfig } from "@/config/site";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { createSession } from "@/lib/auth/client-session";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { ROUTES } from "@/lib/constants";
import { getClientAuth } from "@/lib/firebase/client";
import { isFirebaseClientConfigured } from "@/lib/env/client";

type AuthMode = "sign-in" | "sign-up";

function mapAuthError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled.";
    default:
      return "Authentication failed. Please try again.";
  }
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const configured = isFirebaseClientConfigured();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function finishSignIn() {
    const auth = getClientAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No authenticated user.");
    }
    const idToken = await user.getIdToken();
    await createSession(idToken);
    const redirectTo =
      getSafeRedirectPath(searchParams.get("redirect")) ?? ROUTES.dashboard;
    router.push(redirectTo);
    router.refresh();
  }

  async function handleEmailSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const auth = getClientAuth();
      if (mode === "sign-in") {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
      await finishSignIn();
    } catch (err) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "unknown";
      setError(mapAuthError(code));
    } finally {
      setPending(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setPending(true);

    try {
      const auth = getClientAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      await finishSignIn();
    } catch (err) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "unknown";
      setError(mapAuthError(code));
    } finally {
      setPending(false);
    }
  }

  if (!configured) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground text-sm">
          Firebase is not configured. Add{" "}
          <code className="text-xs">NEXT_PUBLIC_FIREBASE_*</code> and{" "}
          <code className="text-xs">FIREBASE_ADMIN_*</code> to{" "}
          <code className="text-xs">.env.local</code> (see{" "}
          <code className="text-xs">.env.example</code>).
        </p>
        <Link
          href={ROUTES.home}
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {siteConfig.name}
        </h1>
        <p className="text-muted-foreground text-sm">{siteConfig.tagline}</p>
      </div>

      <div className="bg-muted/50 flex rounded-lg p-1">
        <button
          type="button"
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "sign-in"
              ? "bg-background shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setMode("sign-in")}
          disabled={pending}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "sign-up"
              ? "bg-background shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setMode("sign-up")}
          disabled={pending}
        >
          Create account
        </button>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete={
              mode === "sign-in" ? "current-password" : "new-password"
            }
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={pending}
          />
        </div>
        {error ? (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending
            ? "Please wait…"
            : mode === "sign-in"
              ? "Sign in with email"
              : "Create account"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">Or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={pending}
        onClick={handleGoogleSignIn}
      >
        Continue with Google
      </Button>

      <p className="text-muted-foreground text-center text-xs">
        <Link
          href={ROUTES.home}
          className="hover:text-foreground underline-offset-4 hover:underline"
        >
          Back to home
        </Link>
      </p>
    </div>
  );
}
