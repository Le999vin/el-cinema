import type { Config } from "drizzle-kit";

import { env } from "./src/lib/env";

export default {
  schema: "./src/services/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL ?? "postgres://postgres:postgres@127.0.0.1:5432/cinemascope",
  },
  verbose: true,
  strict: true,
} satisfies Config;

