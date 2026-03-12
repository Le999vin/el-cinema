import "server-only";

import { and, eq, gt, lt } from "drizzle-orm";

import { getDb } from "@/services/db/client";
import { sessions, users } from "@/services/db/schema";
import { mapUser } from "@/services/db/repositories/mappers";

export interface SessionRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface SessionWithUser {
  session: SessionRecord;
  user: ReturnType<typeof mapUser>;
}

export const createSessionRecord = async (input: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<SessionRecord> => {
  const db = getDb();
  const [session] = await db
    .insert(sessions)
    .values({
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      updatedAt: new Date(),
    })
    .returning();

  return {
    id: session.id,
    userId: session.userId,
    tokenHash: session.tokenHash,
    expiresAt: session.expiresAt,
  };
};

export const getActiveSessionWithUser = async (tokenHash: string): Promise<SessionWithUser | null> => {
  const db = getDb();
  const now = new Date();

  const result = await db
    .select({
      session: sessions,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
    .limit(1);

  const item = result[0];
  if (!item) {
    return null;
  }

  return {
    session: {
      id: item.session.id,
      userId: item.session.userId,
      tokenHash: item.session.tokenHash,
      expiresAt: item.session.expiresAt,
    },
    user: mapUser(item.user),
  };
};

export const deleteSessionByTokenHash = async (tokenHash: string): Promise<void> => {
  const db = getDb();
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
};

export const deleteExpiredSessions = async (): Promise<void> => {
  const db = getDb();
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
};

