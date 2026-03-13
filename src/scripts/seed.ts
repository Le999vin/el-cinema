import "@/lib/load-env";

import { hasGooglePlaces, hasTmdb } from "@/lib/env";
import { hashPassword } from "@/services/auth/password-core";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/services/db/client";
import { upsertCinemas } from "@/services/db/repositories/cinema-repository";
import { upsertMovies } from "@/services/db/repositories/movie-repository";
import { bulkInsertShowtimes } from "@/services/db/repositories/showtime-repository";
import { createUser } from "@/services/db/repositories/user-repository";
import { syncCinemas, syncMovies, syncSeries } from "@/services/external/sync";
import { cinemas, movies, showtimes, userPreferences, users } from "@/services/db/schema";
import { demoAdminUser, demoCinemas, demoMovies, buildDemoShowtimes } from "@/lib/dev-seed-data";

const buildSeedIdMap = async (db: ReturnType<typeof getDb>) => {
  const [cinemaRows, movieRows] = await Promise.all([
    db.query.cinemas.findMany({
      where: inArray(
        cinemas.googlePlaceId,
        demoCinemas.map((cinema) => cinema.googlePlaceId),
      ),
    }),
    db.query.movies.findMany({
      where: inArray(
        movies.tmdbId,
        demoMovies.map((movie) => movie.tmdbId),
      ),
    }),
  ]);

  const cinemaIdByDemoId = new Map(
    demoCinemas.map((cinema) => {
      const row = cinemaRows.find((item) => item.googlePlaceId === cinema.googlePlaceId);
      if (!row) {
        throw new Error(`Missing seeded cinema for ${cinema.googlePlaceId}.`);
      }

      return [cinema.id, row.id] as const;
    }),
  );

  const movieIdByDemoId = new Map(
    demoMovies.map((movie) => {
      const row = movieRows.find((item) => item.tmdbId === movie.tmdbId);
      if (!row) {
        throw new Error(`Missing seeded movie for TMDb ${movie.tmdbId}.`);
      }

      return [movie.id, row.id] as const;
    }),
  );

  return { cinemaIdByDemoId, movieIdByDemoId };
};

const run = async () => {
  const db = getDb();

  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.email, demoAdminUser.email),
  });

  const adminUserId = existingAdmin
    ? existingAdmin.id
    : (
        await createUser({
          email: demoAdminUser.email,
          displayName: demoAdminUser.displayName,
          passwordHash: await hashPassword(demoAdminUser.password),
          role: "admin",
        })
      ).id;

  await db
    .insert(userPreferences)
    .values({
      userId: adminUserId,
      favouriteGenres: [],
      preferredCinemaIds: [],
      updatedAt: new Date(),
    })
    .onConflictDoNothing({ target: userPreferences.userId });

  await upsertCinemas(demoCinemas);
  await upsertMovies(demoMovies);

  const { cinemaIdByDemoId, movieIdByDemoId } = await buildSeedIdMap(db);

  await db.delete(showtimes);
  await bulkInsertShowtimes(
    buildDemoShowtimes().map((showtime) => ({
      cinemaId: cinemaIdByDemoId.get(showtime.cinemaId) ?? showtime.cinemaId,
      movieId: movieIdByDemoId.get(showtime.movieId) ?? showtime.movieId,
      startsAt: showtime.startsAt,
      language: showtime.language,
      subtitleLanguage: showtime.subtitleLanguage,
      room: showtime.room,
    })),
  );

  let cinemaSyncMessage = "";
  if (hasGooglePlaces) {
    try {
      const cinemaResult = await syncCinemas();
      cinemaSyncMessage = ` Google Places sync imported ${cinemaResult.synced} cinemas.`;
    } catch (error) {
      console.warn("Google Places cinema sync skipped during seed.", error);
      cinemaSyncMessage = " Google Places sync skipped; demo cinema catalog remains available.";
    }
  }

  let tmdbSyncMessage = "";
  if (hasTmdb) {
    try {
      const [movieResult, seriesResult] = await Promise.all([syncMovies(), syncSeries()]);
      tmdbSyncMessage = ` TMDb sync imported ${movieResult.synced} movies and ${seriesResult.synced} series.`;
    } catch (error) {
      console.warn("TMDb catalog sync skipped during seed.", error);
      tmdbSyncMessage = " TMDb sync skipped; demo movie catalog remains available.";
    }
  }

  console.log(`Seed complete.${cinemaSyncMessage}${tmdbSyncMessage}`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
