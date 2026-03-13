import { eq, notInArray } from "drizzle-orm";

import { demoCinemas, demoMovies } from "@/lib/dev-seed-data";
import { hasDatabase, hasGooglePlaces, hasTmdb } from "@/lib/env";
import { SWISS_REGION_CODES } from "@/lib/swiss-discovery-areas";
import { getDb } from "@/services/db/client";
import { upsertCinemas } from "@/services/db/repositories/cinema-repository";
import { upsertMovies, type MovieUpsertInput } from "@/services/db/repositories/movie-repository";
import { upsertSeries, type SeriesUpsertInput } from "@/services/db/repositories/series-repository";
import { cinemas, syncRuns } from "@/services/db/schema";
import { fetchSwissCinemasFromGoogle } from "@/services/external/google-places";
import {
  discoverTmdbMoviesByCollection,
  discoverTmdbSeriesByCollection,
  type TmdbMovieCollection,
  type TmdbSeriesCollection,
} from "@/services/external/tmdb";

const MOVIE_COLLECTIONS: readonly TmdbMovieCollection[] = ["now_playing", "upcoming", "popular", "top_rated"];
const SERIES_COLLECTIONS: readonly TmdbSeriesCollection[] = ["airing_today", "on_the_air", "popular", "top_rated"];

const dedupeByTmdbId = <T extends { tmdbId: number }>(items: readonly T[]) =>
  [...new Map(items.map((item) => [item.tmdbId, item])).values()];

const startSyncRun = async (source: string, details: Record<string, unknown>) => {
  if (!hasDatabase) {
    return null;
  }

  const db = getDb();
  const [row] = await db
    .insert(syncRuns)
    .values({
      source,
      status: "running",
      details,
      startedAt: new Date(),
    })
    .returning({ id: syncRuns.id });

  return row?.id ?? null;
};

const finishSyncRun = async (syncRunId: string | null, status: string, details: Record<string, unknown>) => {
  if (!syncRunId || !hasDatabase) {
    return;
  }

  const db = getDb();
  await db
    .update(syncRuns)
    .set({
      status,
      details,
      finishedAt: new Date(),
    })
    .where(eq(syncRuns.id, syncRunId));
};

const pruneForeignCinemaRows = async () => {
  if (!hasDatabase) {
    return 0;
  }

  const db = getDb();
  const deleted = await db
    .delete(cinemas)
    .where(notInArray(cinemas.region, SWISS_REGION_CODES))
    .returning({ id: cinemas.id });

  return deleted.length;
};

export const syncCinemas = async () => {
  if (!hasDatabase) {
    return { synced: 0, source: "none", reason: "DATABASE_URL missing" };
  }

  const source = hasGooglePlaces ? "google-places" : "demo-fallback";
  const syncRunId = await startSyncRun(source, {
    scope: "cinemas",
    mode: hasGooglePlaces ? "switzerland-discovery" : "demo-fallback",
  });

  try {
    if (!hasGooglePlaces) {
      const synced = await upsertCinemas(demoCinemas);
      const details = {
        scope: "cinemas",
        mode: "demo-fallback",
        discoveredRows: demoCinemas.length,
        dedupedRows: demoCinemas.length,
        upserts: synced,
      };

      await finishSyncRun(syncRunId, "success", details);
      return {
        synced,
        source,
        ...details,
      };
    }

    const discovery = await fetchSwissCinemasFromGoogle();
    const synced = await upsertCinemas(discovery.payload);
    const prunedRows = await pruneForeignCinemaRows();
    const status = discovery.failures.length
      ? discovery.payload.length
        ? "partial"
        : "failed"
      : "success";
    const details = {
      scope: "cinemas",
      mode: "switzerland-discovery",
      searchedAreas: discovery.searchedAreas,
      discoveredRows: discovery.discovered,
      dedupedRows: discovery.deduped,
      upserts: synced,
      prunedRows,
      failures: discovery.failures,
    };

    await finishSyncRun(syncRunId, status, details);

    return {
      synced,
      source,
      searchedAreas: discovery.searchedAreas.length,
      discoveredRows: discovery.discovered,
      dedupedRows: discovery.deduped,
      prunedRows,
      failures: discovery.failures,
      status,
    };
  } catch (error) {
    const details = {
      scope: "cinemas",
      mode: hasGooglePlaces ? "switzerland-discovery" : "demo-fallback",
      error: error instanceof Error ? error.message : "Unknown sync error",
    };

    await finishSyncRun(syncRunId, "failed", details);
    throw error;
  }
};

export const syncMovies = async () => {
  if (!hasDatabase) {
    return { synced: 0, source: "none", reason: "DATABASE_URL missing" };
  }

  const payload: MovieUpsertInput[] = hasTmdb
    ? (
        await Promise.all(MOVIE_COLLECTIONS.map((collection) => discoverTmdbMoviesByCollection(collection)))
      ).flat()
    : demoMovies;

  const deduped = dedupeByTmdbId(payload);
  const synced = await upsertMovies(deduped);

  return {
    synced,
    source: hasTmdb ? "tmdb" : "demo-fallback",
  };
};

export const syncSeries = async () => {
  if (!hasDatabase) {
    return { synced: 0, source: "none", reason: "DATABASE_URL missing" };
  }

  if (!hasTmdb) {
    return { synced: 0, source: "none", reason: "TMDB_API_KEY missing" };
  }

  const payload: SeriesUpsertInput[] = (
    await Promise.all(SERIES_COLLECTIONS.map((collection) => discoverTmdbSeriesByCollection(collection)))
  ).flat();
  const deduped = dedupeByTmdbId(payload);
  const synced = await upsertSeries(deduped);

  return {
    synced,
    source: "tmdb",
  };
};

export const syncCatalog = async () => {
  const [movies, series] = await Promise.all([syncMovies(), syncSeries()]);

  return {
    movies,
    series,
  };
};
