import { and, eq } from "drizzle-orm";

import type { User, UserPreferences, UserProfile, UserRating } from "@/domain/types";
import { getDb } from "@/services/db/client";
import {
  favouriteCinemas,
  seenMovies,
  userPreferences,
  userRatings,
  users,
  watchlistItems,
} from "@/services/db/schema";
import {
  mapFavouriteCinemaId,
  mapSeenMovieId,
  mapUser,
  mapUserPreferences,
  mapUserRating,
} from "@/services/db/repositories/mappers";

const defaultPreferences = (userId: string): UserPreferences => ({
  userId,
  favouriteGenres: [],
  preferredTimeStart: null,
  preferredTimeEnd: null,
  preferredCinemaIds: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createUser = async (input: {
  email: string;
  displayName: string;
  passwordHash: string;
  role?: User["role"];
}): Promise<User> => {
  const db = getDb();

  const [user] = await db
    .insert(users)
    .values({
      email: input.email,
      displayName: input.displayName,
      passwordHash: input.passwordHash,
      role: input.role ?? "user",
      updatedAt: new Date(),
    })
    .returning();

  await db.insert(userPreferences).values({
    userId: user.id,
    favouriteGenres: [],
    preferredCinemaIds: [],
    updatedAt: new Date(),
  });

  return mapUser(user);
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const db = getDb();
  const row = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });

  return row ? mapUser(row) : null;
};

export const getUserById = async (userId: string): Promise<User | null> => {
  const db = getDb();
  const row = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  return row ? mapUser(row) : null;
};

export const getUserPreferences = async (userId: string): Promise<UserPreferences> => {
  const db = getDb();
  const row = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });

  return row ? mapUserPreferences(row) : defaultPreferences(userId);
};

export const upsertUserPreferences = async (
  userId: string,
  preferences: Pick<UserPreferences, "favouriteGenres" | "preferredTimeStart" | "preferredTimeEnd" | "preferredCinemaIds">,
): Promise<UserPreferences> => {
  const db = getDb();

  const [row] = await db
    .insert(userPreferences)
    .values({
      userId,
      favouriteGenres: preferences.favouriteGenres,
      preferredTimeStart: preferences.preferredTimeStart,
      preferredTimeEnd: preferences.preferredTimeEnd,
      preferredCinemaIds: preferences.preferredCinemaIds,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: {
        favouriteGenres: preferences.favouriteGenres,
        preferredTimeStart: preferences.preferredTimeStart,
        preferredTimeEnd: preferences.preferredTimeEnd,
        preferredCinemaIds: preferences.preferredCinemaIds,
        updatedAt: new Date(),
      },
    })
    .returning();

  return mapUserPreferences(row);
};

export const listWatchlistMovieIds = async (userId: string): Promise<string[]> => {
  const db = getDb();
  const rows = await db.query.watchlistItems.findMany({
    where: eq(watchlistItems.userId, userId),
  });

  return rows.map((row) => row.movieId);
};

export const addWatchlistMovie = async (userId: string, movieId: string): Promise<void> => {
  const db = getDb();
  await db
    .insert(watchlistItems)
    .values({ userId, movieId })
    .onConflictDoNothing({ target: [watchlistItems.userId, watchlistItems.movieId] });
};

export const removeWatchlistMovie = async (userId: string, movieId: string): Promise<void> => {
  const db = getDb();
  await db.delete(watchlistItems).where(and(eq(watchlistItems.userId, userId), eq(watchlistItems.movieId, movieId)));
};

export const listSeenMovieIds = async (userId: string): Promise<string[]> => {
  const db = getDb();
  const rows = await db.query.seenMovies.findMany({
    where: eq(seenMovies.userId, userId),
  });

  return rows.map(mapSeenMovieId);
};

export const setSeenMovie = async (userId: string, movieId: string, seen: boolean): Promise<void> => {
  const db = getDb();

  if (seen) {
    await db
      .insert(seenMovies)
      .values({ userId, movieId, seenAt: new Date() })
      .onConflictDoNothing({ target: [seenMovies.userId, seenMovies.movieId] });
    return;
  }

  await db.delete(seenMovies).where(and(eq(seenMovies.userId, userId), eq(seenMovies.movieId, movieId)));
};

export const listFavouriteCinemaIds = async (userId: string): Promise<string[]> => {
  const db = getDb();
  const rows = await db.query.favouriteCinemas.findMany({
    where: eq(favouriteCinemas.userId, userId),
  });

  return rows.map(mapFavouriteCinemaId);
};

export const addFavouriteCinema = async (userId: string, cinemaId: string): Promise<void> => {
  const db = getDb();
  await db
    .insert(favouriteCinemas)
    .values({ userId, cinemaId })
    .onConflictDoNothing({ target: [favouriteCinemas.userId, favouriteCinemas.cinemaId] });
};

export const removeFavouriteCinema = async (userId: string, cinemaId: string): Promise<void> => {
  const db = getDb();
  await db
    .delete(favouriteCinemas)
    .where(and(eq(favouriteCinemas.userId, userId), eq(favouriteCinemas.cinemaId, cinemaId)));
};

export const listUserRatings = async (userId: string): Promise<UserRating[]> => {
  const db = getDb();
  const rows = await db.query.userRatings.findMany({
    where: eq(userRatings.userId, userId),
  });

  return rows.map(mapUserRating);
};

export const upsertUserRating = async (
  userId: string,
  payload: Omit<UserRating, "userId" | "createdAt" | "updatedAt">,
): Promise<UserRating> => {
  const db = getDb();

  const [row] = await db
    .insert(userRatings)
    .values({
      userId,
      movieId: payload.movieId,
      story: payload.story.toFixed(1),
      tension: payload.tension.toFixed(1),
      acting: payload.acting.toFixed(1),
      visuals: payload.visuals.toFixed(1),
      soundtrack: payload.soundtrack.toFixed(1),
      overall: payload.overall.toFixed(1),
      note: payload.note,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [userRatings.userId, userRatings.movieId],
      set: {
        story: payload.story.toFixed(1),
        tension: payload.tension.toFixed(1),
        acting: payload.acting.toFixed(1),
        visuals: payload.visuals.toFixed(1),
        soundtrack: payload.soundtrack.toFixed(1),
        overall: payload.overall.toFixed(1),
        note: payload.note,
        updatedAt: new Date(),
      },
    })
    .returning();

  return mapUserRating(row);
};

export const deleteUserRating = async (userId: string, movieId: string): Promise<void> => {
  const db = getDb();
  await db.delete(userRatings).where(and(eq(userRatings.userId, userId), eq(userRatings.movieId, movieId)));
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const user = await getUserById(userId);
  if (!user) {
    return null;
  }

  const [preferences, favouriteCinemaIds, watchlistMovieIds, seenMovieIds, ratings] = await Promise.all([
    getUserPreferences(userId),
    listFavouriteCinemaIds(userId),
    listWatchlistMovieIds(userId),
    listSeenMovieIds(userId),
    listUserRatings(userId),
  ]);

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    },
    preferences,
    favouriteCinemaIds,
    watchlistMovieIds,
    seenMovieIds,
    ratings,
  };
};
