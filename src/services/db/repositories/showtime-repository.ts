import { and, asc, between, eq } from "drizzle-orm";

import type { Showtime } from "@/domain/types";
import { getDb } from "@/services/db/client";
import { showtimes } from "@/services/db/schema";
import { mapShowtime } from "@/services/db/repositories/mappers";

interface ShowtimeQuery {
  cinemaId?: string;
  movieId?: string;
  startsAtFrom?: Date;
  startsAtTo?: Date;
}

export const listShowtimes = async (query: ShowtimeQuery = {}): Promise<Showtime[]> => {
  const db = getDb();

  const conditions = [
    query.cinemaId ? eq(showtimes.cinemaId, query.cinemaId) : undefined,
    query.movieId ? eq(showtimes.movieId, query.movieId) : undefined,
    query.startsAtFrom && query.startsAtTo
      ? between(showtimes.startsAt, query.startsAtFrom, query.startsAtTo)
      : undefined,
  ].filter(Boolean);

  const rows = conditions.length
    ? await db
        .select()
        .from(showtimes)
        .where(and(...conditions))
        .orderBy(asc(showtimes.startsAt))
    : await db.select().from(showtimes).orderBy(asc(showtimes.startsAt));

  return rows.map(mapShowtime);
};

export const getShowtimeById = async (showtimeId: string): Promise<Showtime | null> => {
  const db = getDb();
  const row = await db.query.showtimes.findFirst({
    where: eq(showtimes.id, showtimeId),
  });

  return row ? mapShowtime(row) : null;
};

export const createShowtime = async (
  payload: Pick<Showtime, "cinemaId" | "movieId" | "startsAt" | "language" | "subtitleLanguage" | "room">,
): Promise<Showtime> => {
  const db = getDb();
  const [row] = await db
    .insert(showtimes)
    .values({
      cinemaId: payload.cinemaId,
      movieId: payload.movieId,
      startsAt: payload.startsAt,
      language: payload.language,
      subtitleLanguage: payload.subtitleLanguage,
      room: payload.room,
      manuallyManaged: true,
      updatedAt: new Date(),
    })
    .returning();

  return mapShowtime(row);
};

export const updateShowtime = async (
  showtimeId: string,
  payload: Partial<Pick<Showtime, "cinemaId" | "movieId" | "startsAt" | "language" | "subtitleLanguage" | "room">>,
): Promise<Showtime | null> => {
  const db = getDb();
  const [row] = await db
    .update(showtimes)
    .set({
      cinemaId: payload.cinemaId,
      movieId: payload.movieId,
      startsAt: payload.startsAt,
      language: payload.language,
      subtitleLanguage: payload.subtitleLanguage,
      room: payload.room,
      updatedAt: new Date(),
    })
    .where(eq(showtimes.id, showtimeId))
    .returning();

  return row ? mapShowtime(row) : null;
};

export const deleteShowtime = async (showtimeId: string): Promise<boolean> => {
  const db = getDb();
  const deleted = await db.delete(showtimes).where(eq(showtimes.id, showtimeId)).returning({ id: showtimes.id });
  return deleted.length > 0;
};

export const bulkInsertShowtimes = async (
  payload: Array<Pick<Showtime, "cinemaId" | "movieId" | "startsAt" | "language" | "subtitleLanguage" | "room">>,
): Promise<number> => {
  if (!payload.length) {
    return 0;
  }

  const db = getDb();

  await db.insert(showtimes).values(
    payload.map((item) => ({
      cinemaId: item.cinemaId,
      movieId: item.movieId,
      startsAt: item.startsAt,
      language: item.language,
      subtitleLanguage: item.subtitleLanguage,
      room: item.room,
      manuallyManaged: true,
      updatedAt: new Date(),
    })),
  );

  return payload.length;
};
