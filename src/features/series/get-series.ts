import type { SeriesDetails, SeriesSummary } from "@/domain/types";
import { ensureSeriesDetailsFresh, ensureSeriesSearchResults } from "@/features/catalog/enrich-catalog";
import { hasDatabase } from "@/lib/env";
import { querySeries } from "@/services/db/repositories/series-repository";

export interface SeriesQuery {
  search?: string;
  genres?: string[];
  sort?: "title" | "release-date" | "runtime";
}

export const getSeries = async (query: SeriesQuery = {}): Promise<SeriesSummary[]> => {
  if (!hasDatabase) {
    return [];
  }

  if (query.search?.trim()) {
    await ensureSeriesSearchResults(query.search);
  }

  const entries = await querySeries(query);

  return entries.map((entry) => ({
    id: entry.id,
    tmdbId: entry.tmdbId,
    name: entry.name,
    genres: entry.genres,
    posterUrl: entry.posterUrl,
    firstAirDate: entry.firstAirDate,
    episodeRuntimeMinutes: entry.episodeRuntimeMinutes,
  }));
};

export const getSeriesDetails = async (seriesId: string): Promise<SeriesDetails | null> => {
  if (!hasDatabase) {
    return null;
  }

  return ensureSeriesDetailsFresh(seriesId);
};
