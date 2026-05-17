export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") {
    return;
  }

  const { logEnvStatus } = await import("@/lib/env/validate");
  logEnvStatus();
}
