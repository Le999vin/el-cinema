import "dotenv/config";

import { hashPassword } from "@/services/auth/password";
import { getDb } from "@/services/db/client";
import { upsertCinemas } from "@/services/db/repositories/cinema-repository";
import { upsertMovies } from "@/services/db/repositories/movie-repository";
import { bulkInsertShowtimes } from "@/services/db/repositories/showtime-repository";
import { users, showtimes } from "@/services/db/schema";
import { demoAdminUser, demoCinemas, demoMovies, buildDemoShowtimes } from "@/lib/dev-seed-data";
import { eq } from "drizzle-orm";

const run = async () => {
  const db = getDb();

  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.email, demoAdminUser.email),
  });

  if (!existingAdmin) {
    const passwordHash = await hashPassword(demoAdminUser.password);

    await db.insert(users).values({
      email: demoAdminUser.email,
      displayName: demoAdminUser.displayName,
      passwordHash,
      role: "admin",
      updatedAt: new Date(),
    });
  }

  await upsertCinemas(demoCinemas);
  await upsertMovies(demoMovies);

  await db.delete(showtimes);
  await bulkInsertShowtimes(
    buildDemoShowtimes().map((showtime) => ({
      cinemaId: showtime.cinemaId,
      movieId: showtime.movieId,
      startsAt: showtime.startsAt,
      language: showtime.language,
      subtitleLanguage: showtime.subtitleLanguage,
      room: showtime.room,
    })),
  );

  console.log("Seed complete.");
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

