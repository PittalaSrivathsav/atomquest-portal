/**
 * Client-safe redirect helpers (no server-only imports).
 */
export function getSafeRedirectPath(
  redirect: string | null | undefined,
): string | null {
  if (!redirect) {
    return null;
  }
  if (!redirect.startsWith("/dashboard")) {
    return null;
  }
  if (redirect.startsWith("//")) {
    return null;
  }
  return redirect;
}
