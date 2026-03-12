import "server-only";

import { env, hasTmdb } from "@/lib/env";
import { normalizeTmdbMovie, parseTmdbList, parseTmdbMovie } from "@/services/external/normalizers-tmdb";

const BASE_URL = "https://api.themoviedb.org/3";

const fetchTmdb = async (path: string): Promise<unknown> => {
  if (!env.TMDB_API_KEY) {
    return { results: [] };
  }

  const response = await fetch(`${BASE_URL}${path}${path.includes("?") ? "&" : "?"}api_key=${env.TMDB_API_KEY}`, {
    next: { revalidate: 60 * 60 * 6 },
  });

  if (!response.ok) {
    throw new Error(`TMDb request failed (${response.status}).`);
  }

  return response.json();
};

export const discoverTmdbNowShowing = async () => {
  if (!hasTmdb) {
    return [];
  }

  const payload = await fetchTmdb("/movie/now_playing?language=en-US&page=1");
  const parsed = parseTmdbList(payload);
  return parsed.results.map(normalizeTmdbMovie);
};

export const discoverTmdbUpcoming = async () => {
  if (!hasTmdb) {
    return [];
  }

  const payload = await fetchTmdb("/movie/upcoming?language=en-US&page=1");
  const parsed = parseTmdbList(payload);
  return parsed.results.map(normalizeTmdbMovie);
};

export const searchTmdbMovies = async (query: string) => {
  if (!hasTmdb) {
    return [];
  }

  const payload = await fetchTmdb(`/search/movie?language=en-US&page=1&query=${encodeURIComponent(query)}`);
  const parsed = parseTmdbList(payload);
  return parsed.results.map(normalizeTmdbMovie);
};

export const fetchTmdbMovieDetails = async (tmdbId: number) => {
  if (!hasTmdb) {
    return null;
  }

  const payload = await fetchTmdb(`/movie/${tmdbId}?language=en-US`);
  const parsed = parseTmdbMovie(payload);
  return normalizeTmdbMovie(parsed);
};

