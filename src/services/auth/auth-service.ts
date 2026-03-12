import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { hasDatabase } from "@/lib/env";
import { loginInputSchema, registerInputSchema } from "@/domain/schemas";
import type { User } from "@/domain/types";
import { hashPassword, verifyPassword } from "@/services/auth/password";
import {
  buildSessionExpiresAt,
  clearSessionCookie,
  generateSessionToken,
  hashSessionToken,
  sessionCookie,
} from "@/services/auth/session";
import { createUser, getUserByEmail } from "@/services/db/repositories/user-repository";
import {
  createSessionRecord,
  deleteSessionByTokenHash,
  getActiveSessionWithUser,
} from "@/services/session/session-repository";

export type SafeUser = Pick<User, "id" | "email" | "displayName" | "role">;

const toSafeUser = (user: User): SafeUser => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  role: user.role,
});

export const registerUser = async (input: unknown): Promise<SafeUser> => {
  if (!hasDatabase) {
    throw new Error("Database is required for registration.");
  }

  const data = registerInputSchema.parse(input);
  const existing = await getUserByEmail(data.email.toLowerCase());
  if (existing) {
    throw new Error("Email already in use.");
  }

  const passwordHash = await hashPassword(data.password);
  const user = await createUser({
    email: data.email.toLowerCase(),
    displayName: data.displayName,
    passwordHash,
    role: "user",
  });

  return toSafeUser(user);
};

export const loginUser = async (input: unknown): Promise<{ user: SafeUser; token: string; expiresAt: Date }> => {
  if (!hasDatabase) {
    throw new Error("Database is required for login.");
  }

  const data = loginInputSchema.parse(input);

  const user = await getUserByEmail(data.email.toLowerCase());
  if (!user) {
    throw new Error("Invalid credentials.");
  }

  const validPassword = await verifyPassword(data.password, user.passwordHash);
  if (!validPassword) {
    throw new Error("Invalid credentials.");
  }

  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = buildSessionExpiresAt();

  await createSessionRecord({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  return {
    user: toSafeUser(user),
    token,
    expiresAt,
  };
};

export const resolveCurrentUser = async (): Promise<SafeUser | null> => {
  if (!hasDatabase) {
    return null;
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return null;
  }

  const tokenHash = hashSessionToken(sessionToken);
  const session = await getActiveSessionWithUser(tokenHash);

  return session ? toSafeUser(session.user) : null;
};

export const requireUser = async (): Promise<SafeUser> => {
  const user = await resolveCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
};

export const requireAdmin = async (): Promise<SafeUser> => {
  const user = await requireUser();
  if (user.role !== "admin") {
    redirect("/");
  }
  return user;
};

export const getSessionCookiePayload = (token: string, expiresAt: Date) => sessionCookie(token, expiresAt);

export const getClearSessionCookiePayload = () => clearSessionCookie();

export const logoutWithToken = async (token: string): Promise<void> => {
  if (!hasDatabase) {
    return;
  }

  const tokenHash = hashSessionToken(token);
  await deleteSessionByTokenHash(tokenHash);
};

