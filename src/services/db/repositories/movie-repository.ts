import { asc, eq, sql } from "drizzle-orm";

import type { Movie } from "@/domain/types";
import { getDb } from "@/services/db/client";
import { movies } from "@/services/db/schema";
import { mapMovie } from "@/services/db/repositories/mappers";

type MovieUpsertInput = Pick<
  Movie,
  "tmdbId" | "title" | "overview" | "genres" | "runtimeMinutes" | "posterUrl" | "backdropUrl" | "releaseDate" | "voteAverage"
> &
  Partial<Pick<Movie, "id">>;

export const listMovies = async (): Promise<Movie[]> => {
  const db = getDb();
  const rows = await db.select().from(movies).orderBy(asc(movies.title));
  return rows.map(mapMovie);
};

export const searchMovies = async (query: string): Promise<Movie[]> => {
  const db = getDb();
  const rows = await db
    .select()
    .from(movies)
    .where(sql`${movies.title} ilike ${`%${query}%`} or ${movies.overview} ilike ${`%${query}%`}`)
    .orderBy(asc(movies.title));

  return rows.map(mapMovie);
};

export const getMovieById = async (movieId: string): Promise<Movie | null> => {
  const db = getDb();
  const row = await db.query.movies.findFirst({
    where: eq(movies.id, movieId),
  });

  return row ? mapMovie(row) : null;
};

export const getMovieByTmdbId = async (tmdbId: number): Promise<Movie | null> => {
  const db = getDb();
  const row = await db.query.movies.findFirst({
    where: eq(movies.tmdbId, tmdbId),
  });

  return row ? mapMovie(row) : null;
};

export const upsertMovies = async (payload: MovieUpsertInput[]): Promise<number> => {
  if (!payload.length) {
    return 0;
  }

  const db = getDb();

  await db
    .insert(movies)
    .values(
      payload.map((movie) => ({
        id: movie.id,
        tmdbId: movie.tmdbId,
        title: movie.title,
        overview: movie.overview,
        genres: movie.genres,
        runtimeMinutes: movie.runtimeMinutes,
        posterUrl: movie.posterUrl,
        backdropUrl: movie.backdropUrl,
        releaseDate: movie.releaseDate,
        voteAverage: movie.voteAverage?.toFixed(1),
        sourceUpdatedAt: new Date(),
        updatedAt: new Date(),
      })),
    )
    .onConflictDoUpdate({
      target: movies.tmdbId,
      set: {
        title: sql`excluded.title`,
        overview: sql`excluded.overview`,
        genres: sql`excluded.genres`,
        runtimeMinutes: sql`excluded.runtime_minutes`,
        posterUrl: sql`excluded.poster_url`,
        backdropUrl: sql`excluded.backdrop_url`,
        releaseDate: sql`excluded.release_date`,
        voteAverage: sql`excluded.vote_average`,
        sourceUpdatedAt: sql`excluded.source_updated_at`,
        updatedAt: new Date(),
      },
    });

  return payload.length;
};
