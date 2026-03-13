import { and, asc, eq, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

import type { Movie } from "@/domain/types";
import { getDb } from "@/services/db/client";
import { movies } from "@/services/db/schema";
import { mapMovie } from "@/services/db/repositories/mappers";

export type MovieUpsertInput = Pick<
  Movie,
  "tmdbId" | "title" | "overview" | "genres" | "runtimeMinutes" | "posterUrl" | "backdropUrl" | "releaseDate" | "voteAverage"
> &
  Partial<Pick<Movie, "id">>;

export interface MovieListQuery {
  search?: string;
  genres?: string[];
  sort?: "title" | "release-date" | "runtime";
  limit?: number;
}

const buildMovieSearchCondition = (query: string): SQL | undefined => {
  const trimmed = query.trim();
  if (!trimmed) {
    return undefined;
  }

  const pattern = `%${trimmed}%`;
  const normalizedPattern = `%${trimmed.toLowerCase()}%`;

  return sql`(
    ${movies.title} ilike ${pattern}
    or ${movies.overview} ilike ${pattern}
    or exists (
      select 1
      from jsonb_array_elements_text(${movies.genres}) as genre(value)
      where lower(genre.value) like ${normalizedPattern}
    )
  )`;
};

const buildMovieGenreCondition = (genresInput: readonly string[]): SQL | undefined => {
  if (!genresInput.length) {
    return undefined;
  }

  const clauses = genresInput.map((genre) => sql`${movies.genres} @> ${JSON.stringify([genre])}::jsonb`);
  return clauses.length === 1 ? clauses[0] : sql`(${sql.join(clauses, sql` or `)})`;
};

const buildMovieOrder = (mode: NonNullable<MovieListQuery["sort"]>) => {
  if (mode === "release-date") {
    return [sql`${movies.releaseDate} desc nulls last`, asc(movies.title)] as const;
  }

  if (mode === "runtime") {
    return [sql`${movies.runtimeMinutes} desc nulls last`, asc(movies.title)] as const;
  }

  return [asc(movies.title)] as const;
};

export const listMovies = async (): Promise<Movie[]> => {
  const db = getDb();
  const rows = await db.select().from(movies).orderBy(asc(movies.title));
  return rows.map(mapMovie);
};

export const queryMovies = async (query: MovieListQuery = {}): Promise<Movie[]> => {
  const db = getDb();
  const conditions = [buildMovieSearchCondition(query.search ?? ""), buildMovieGenreCondition(query.genres ?? [])].filter(
    (condition): condition is SQL => Boolean(condition),
  );

  let statement = db.select().from(movies).$dynamic();

  if (conditions.length) {
    statement = statement.where(and(...conditions));
  }

  statement = statement.orderBy(...buildMovieOrder(query.sort ?? "title"));

  if (query.limit) {
    statement = statement.limit(query.limit);
  }

  const rows = await statement;
  return rows.map(mapMovie);
};

export const searchMovies = async (query: string): Promise<Movie[]> => {
  return queryMovies({ search: query, sort: "title" });
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
