import type { Movie, Series } from "@/domain/types";
import { hasDatabase, hasTmdb } from "@/lib/env";
import { getMovieById, queryMovies, upsertMovies } from "@/services/db/repositories/movie-repository";
import { getSeriesById, querySeries, upsertSeries } from "@/services/db/repositories/series-repository";
import {
  fetchTmdbMovieDetails,
  fetchTmdbSeriesDetails,
  searchTmdbMovies,
  searchTmdbSeries,
} from "@/services/external/tmdb";

const SEARCH_BACKFILL_MIN_RESULTS = 12;
const SEARCH_BACKFILL_LIMIT = 20;
const DETAIL_STALE_MS = 1000 * 60 * 60 * 24 * 7;

const isOlderThanThreshold = (value: Date | null | undefined) =>
  !value || Date.now() - value.getTime() > DETAIL_STALE_MS;

const shouldRefreshMovieDetails = (movie: Movie) => movie.runtimeMinutes == null || isOlderThanThreshold(movie.sourceUpdatedAt);

const shouldRefreshSeriesDetails = (entry: Series) =>
  entry.episodeRuntimeMinutes == null ||
  entry.numberOfSeasons == null ||
  entry.numberOfEpisodes == null ||
  isOlderThanThreshold(entry.sourceUpdatedAt);

export const ensureMovieSearchResults = async (query: string) => {
  const trimmed = query.trim();
  if (!hasDatabase || !hasTmdb || !trimmed) {
    return 0;
  }

  const existing = await queryMovies({ search: trimmed, sort: "title", limit: SEARCH_BACKFILL_MIN_RESULTS });
  if (existing.length >= SEARCH_BACKFILL_MIN_RESULTS) {
    return 0;
  }

  try {
    const tmdbMatches = (await searchTmdbMovies(trimmed)).slice(0, SEARCH_BACKFILL_LIMIT);
    const existingIds = new Set(existing.map((movie) => movie.tmdbId));
    const missing = tmdbMatches.filter((movie) => !existingIds.has(movie.tmdbId));
    return await upsertMovies(missing);
  } catch (error) {
    console.error("Movie TMDb enrichment failed.", error);
    return 0;
  }
};

export const ensureSeriesSearchResults = async (query: string) => {
  const trimmed = query.trim();
  if (!hasDatabase || !hasTmdb || !trimmed) {
    return 0;
  }

  const existing = await querySeries({ search: trimmed, sort: "title", limit: SEARCH_BACKFILL_MIN_RESULTS });
  if (existing.length >= SEARCH_BACKFILL_MIN_RESULTS) {
    return 0;
  }

  try {
    const tmdbMatches = (await searchTmdbSeries(trimmed)).slice(0, SEARCH_BACKFILL_LIMIT);
    const existingIds = new Set(existing.map((entry) => entry.tmdbId));
    const missing = tmdbMatches.filter((entry) => !existingIds.has(entry.tmdbId));
    return await upsertSeries(missing);
  } catch (error) {
    console.error("Series TMDb enrichment failed.", error);
    return 0;
  }
};

export const ensureMovieDetailsFresh = async (movieId: string) => {
  const current = await getMovieById(movieId);
  if (!current || !hasDatabase || !hasTmdb || !shouldRefreshMovieDetails(current)) {
    return current;
  }

  try {
    const details = await fetchTmdbMovieDetails(current.tmdbId);
    if (!details) {
      return current;
    }

    await upsertMovies([{ id: current.id, ...details }]);
    return await getMovieById(movieId);
  } catch (error) {
    console.error("Movie TMDb detail refresh failed.", error);
    return current;
  }
};

export const ensureSeriesDetailsFresh = async (seriesId: string) => {
  const current = await getSeriesById(seriesId);
  if (!current || !hasDatabase || !hasTmdb || !shouldRefreshSeriesDetails(current)) {
    return current;
  }

  try {
    const details = await fetchTmdbSeriesDetails(current.tmdbId);
    if (!details) {
      return current;
    }

    await upsertSeries([{ id: current.id, ...details }]);
    return await getSeriesById(seriesId);
  } catch (error) {
    console.error("Series TMDb detail refresh failed.", error);
    return current;
  }
};
