import { and, asc, eq, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

import type { Series } from "@/domain/types";
import { getDb } from "@/services/db/client";
import { series } from "@/services/db/schema";
import { mapSeries } from "@/services/db/repositories/mappers";

export type SeriesUpsertInput = Pick<
  Series,
  | "tmdbId"
  | "name"
  | "overview"
  | "genres"
  | "episodeRuntimeMinutes"
  | "posterUrl"
  | "backdropUrl"
  | "firstAirDate"
  | "voteAverage"
  | "numberOfSeasons"
  | "numberOfEpisodes"
> &
  Partial<Pick<Series, "id">>;

export interface SeriesListQuery {
  search?: string;
  genres?: string[];
  sort?: "title" | "release-date" | "runtime";
  limit?: number;
}

const buildSeriesSearchCondition = (query: string): SQL | undefined => {
  const trimmed = query.trim();
  if (!trimmed) {
    return undefined;
  }

  const pattern = `%${trimmed}%`;
  const normalizedPattern = `%${trimmed.toLowerCase()}%`;

  return sql`(
    ${series.name} ilike ${pattern}
    or ${series.overview} ilike ${pattern}
    or exists (
      select 1
      from jsonb_array_elements_text(${series.genres}) as genre(value)
      where lower(genre.value) like ${normalizedPattern}
    )
  )`;
};

const buildSeriesGenreCondition = (genresInput: readonly string[]): SQL | undefined => {
  if (!genresInput.length) {
    return undefined;
  }

  const clauses = genresInput.map((genre) => sql`${series.genres} @> ${JSON.stringify([genre])}::jsonb`);
  return clauses.length === 1 ? clauses[0] : sql`(${sql.join(clauses, sql` or `)})`;
};

const buildSeriesOrder = (mode: NonNullable<SeriesListQuery["sort"]>) => {
  if (mode === "release-date") {
    return [sql`${series.firstAirDate} desc nulls last`, asc(series.name)] as const;
  }

  if (mode === "runtime") {
    return [sql`${series.episodeRuntimeMinutes} desc nulls last`, asc(series.name)] as const;
  }

  return [asc(series.name)] as const;
};

export const listSeries = async (): Promise<Series[]> => {
  const db = getDb();
  const rows = await db.select().from(series).orderBy(asc(series.name));
  return rows.map(mapSeries);
};

export const querySeries = async (query: SeriesListQuery = {}): Promise<Series[]> => {
  const db = getDb();
  const conditions = [buildSeriesSearchCondition(query.search ?? ""), buildSeriesGenreCondition(query.genres ?? [])].filter(
    (condition): condition is SQL => Boolean(condition),
  );

  let statement = db.select().from(series).$dynamic();

  if (conditions.length) {
    statement = statement.where(and(...conditions));
  }

  statement = statement.orderBy(...buildSeriesOrder(query.sort ?? "title"));

  if (query.limit) {
    statement = statement.limit(query.limit);
  }

  const rows = await statement;
  return rows.map(mapSeries);
};

export const getSeriesById = async (seriesId: string): Promise<Series | null> => {
  const db = getDb();
  const row = await db.query.series.findFirst({
    where: eq(series.id, seriesId),
  });

  return row ? mapSeries(row) : null;
};

export const getSeriesByTmdbId = async (tmdbId: number): Promise<Series | null> => {
  const db = getDb();
  const row = await db.query.series.findFirst({
    where: eq(series.tmdbId, tmdbId),
  });

  return row ? mapSeries(row) : null;
};

export const upsertSeries = async (payload: SeriesUpsertInput[]): Promise<number> => {
  if (!payload.length) {
    return 0;
  }

  const db = getDb();

  await db
    .insert(series)
    .values(
      payload.map((entry) => ({
        id: entry.id,
        tmdbId: entry.tmdbId,
        name: entry.name,
        overview: entry.overview,
        genres: entry.genres,
        episodeRuntimeMinutes: entry.episodeRuntimeMinutes,
        posterUrl: entry.posterUrl,
        backdropUrl: entry.backdropUrl,
        firstAirDate: entry.firstAirDate,
        voteAverage: entry.voteAverage?.toFixed(1),
        numberOfSeasons: entry.numberOfSeasons,
        numberOfEpisodes: entry.numberOfEpisodes,
        sourceUpdatedAt: new Date(),
        updatedAt: new Date(),
      })),
    )
    .onConflictDoUpdate({
      target: series.tmdbId,
      set: {
        name: sql`excluded.name`,
        overview: sql`excluded.overview`,
        genres: sql`excluded.genres`,
        episodeRuntimeMinutes: sql`excluded.episode_runtime_minutes`,
        posterUrl: sql`excluded.poster_url`,
        backdropUrl: sql`excluded.backdrop_url`,
        firstAirDate: sql`excluded.first_air_date`,
        voteAverage: sql`excluded.vote_average`,
        numberOfSeasons: sql`excluded.number_of_seasons`,
        numberOfEpisodes: sql`excluded.number_of_episodes`,
        sourceUpdatedAt: sql`excluded.source_updated_at`,
        updatedAt: new Date(),
      },
    });

  return payload.length;
};
