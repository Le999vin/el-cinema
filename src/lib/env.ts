import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url().optional(),
  GOOGLE_PLACES_API_KEY: z.string().min(1).optional(),
  TMDB_API_KEY: z.string().min(1).optional(),
  INTERNAL_SYNC_SECRET: z.string().min(12).optional(),
});

const parsed = envSchema.safeParse(process.env);

export const env = parsed.success
  ? parsed.data
  : {
      NODE_ENV: "development" as const,
      DATABASE_URL: undefined,
      GOOGLE_PLACES_API_KEY: undefined,
      TMDB_API_KEY: undefined,
      INTERNAL_SYNC_SECRET: undefined,
    };

export const hasDatabase = Boolean(env.DATABASE_URL);
export const hasGooglePlaces = Boolean(env.GOOGLE_PLACES_API_KEY);
export const hasTmdb = Boolean(env.TMDB_API_KEY);

export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";

