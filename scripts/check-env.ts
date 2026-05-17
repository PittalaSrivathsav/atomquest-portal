import { config } from "dotenv";
import { resolve } from "node:path";

import { checkEnvFeatures } from "../lib/env/validate";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const results = checkEnvFeatures();
const ok = results.every((result) => result.configured);

for (const result of results) {
  const status = result.configured ? "ok" : "missing";
  console.log(
    `${status.padEnd(7)} ${result.label}${
      result.missingKeys.length
        ? ` (${result.missingKeys.join(", ")})`
        : ""
    }`,
  );
}

if (!ok) {
  console.error(
    "\nSome environment groups are incomplete. See .env.example and .env.local.",
  );
  process.exit(1);
}

console.log("\nAll environment groups are configured.");
