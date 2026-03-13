import { env, hasTmdb } from "@/lib/env";
import {
  normalizeTmdbMovie,
  normalizeTmdbSeries,
  parseTmdbMovie,
  parseTmdbMovieList,
  parseTmdbSeries,
  parseTmdbSeriesList,
} from "@/services/external/normalizers-tmdb";

const BASE_URL = "https://api.themoviedb.org/3";

const TMDB_DISCOVERY_PAGES = 2;
const TMDB_DISCOVERY_REVALIDATE_SECONDS = 60 * 60 * 6;
const TMDB_SEARCH_REVALIDATE_SECONDS = 60 * 60;
const TMDB_DETAIL_REVALIDATE_SECONDS = 60 * 60 * 24;

export type TmdbMovieCollection = "now_playing" | "upcoming" | "popular" | "top_rated";
export type TmdbSeriesCollection = "airing_today" | "on_the_air" | "popular" | "top_rated";

const fetchTmdb = async (path: string, revalidate: number): Promise<unknown> => {
  if (!env.TMDB_API_KEY) {
    return { results: [] };
  }

  const response = await fetch(`${BASE_URL}${path}${path.includes("?") ? "&" : "?"}api_key=${env.TMDB_API_KEY}`, {
    next: { revalidate },
  });

  if (!response.ok) {
    throw new Error(`TMDb request failed (${response.status}).`);
  }

  return response.json();
};

const discoverTmdbMoviesByPath = async (path: string, pages = TMDB_DISCOVERY_PAGES) => {
  if (!hasTmdb) {
    return [];
  }

  const payloads = await Promise.all(
    Array.from({ length: pages }, (_, index) =>
      fetchTmdb(`${path}?language=en-US&page=${index + 1}`, TMDB_DISCOVERY_REVALIDATE_SECONDS),
    ),
  );

  return payloads.flatMap((payload) => parseTmdbMovieList(payload).results.map(normalizeTmdbMovie));
};

const discoverTmdbSeriesByPath = async (path: string, pages = TMDB_DISCOVERY_PAGES) => {
  if (!hasTmdb) {
    return [];
  }

  const payloads = await Promise.all(
    Array.from({ length: pages }, (_, index) =>
      fetchTmdb(`${path}?language=en-US&page=${index + 1}`, TMDB_DISCOVERY_REVALIDATE_SECONDS),
    ),
  );

  return payloads.flatMap((payload) => parseTmdbSeriesList(payload).results.map(normalizeTmdbSeries));
};

export const discoverTmdbMoviesByCollection = async (collection: TmdbMovieCollection) => {
  return discoverTmdbMoviesByPath(`/movie/${collection}`);
};

export const discoverTmdbSeriesByCollection = async (collection: TmdbSeriesCollection) => {
  return discoverTmdbSeriesByPath(`/tv/${collection}`);
};

export const discoverTmdbNowShowing = async () => discoverTmdbMoviesByCollection("now_playing");

export const discoverTmdbUpcoming = async () => discoverTmdbMoviesByCollection("upcoming");

export const searchTmdbMovies = async (query: string) => {
  if (!hasTmdb || !query.trim()) {
    return [];
  }

  const payload = await fetchTmdb(
    `/search/movie?language=en-US&page=1&query=${encodeURIComponent(query)}`,
    TMDB_SEARCH_REVALIDATE_SECONDS,
  );
  return parseTmdbMovieList(payload).results.map(normalizeTmdbMovie);
};

export const searchTmdbSeries = async (query: string) => {
  if (!hasTmdb || !query.trim()) {
    return [];
  }

  const payload = await fetchTmdb(
    `/search/tv?language=en-US&page=1&query=${encodeURIComponent(query)}`,
    TMDB_SEARCH_REVALIDATE_SECONDS,
  );
  return parseTmdbSeriesList(payload).results.map(normalizeTmdbSeries);
};

export const fetchTmdbMovieDetails = async (tmdbId: number) => {
  if (!hasTmdb) {
    return null;
  }

  const payload = await fetchTmdb(`/movie/${tmdbId}?language=en-US`, TMDB_DETAIL_REVALIDATE_SECONDS);
  return normalizeTmdbMovie(parseTmdbMovie(payload));
};

export const fetchTmdbSeriesDetails = async (tmdbId: number) => {
  if (!hasTmdb) {
    return null;
  }

  const payload = await fetchTmdb(`/tv/${tmdbId}?language=en-US`, TMDB_DETAIL_REVALIDATE_SECONDS);
  return normalizeTmdbSeries(parseTmdbSeries(payload));
};
