import "server-only";

import { createHash, randomBytes } from "crypto";
import { addDays } from "date-fns";

import { SESSION_COOKIE_NAME, SESSION_DURATION_DAYS } from "@/lib/constants";

export const generateSessionToken = (): string => randomBytes(32).toString("base64url");

export const hashSessionToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

export const buildSessionExpiresAt = (): Date => addDays(new Date(), SESSION_DURATION_DAYS);

export const sessionCookie = (token: string, expiresAt: Date) => ({
  name: SESSION_COOKIE_NAME,
  value: token,
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  },
});

export const clearSessionCookie = () => ({
  name: SESSION_COOKIE_NAME,
  value: "",
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  },
});

