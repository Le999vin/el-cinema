import type { Config } from "drizzle-kit";

import { loadAppEnv } from "./src/lib/load-env";
import { env } from "./src/lib/env";

loadAppEnv();

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for Drizzle commands.");
}

export default {
  schema: "./src/services/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
} satisfies Config;
