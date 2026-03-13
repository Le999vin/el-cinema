import { env, hasTmdb } from "@/lib/env";
import { normalizeTmdbMovie, parseTmdbList, parseTmdbMovie } from "@/services/external/normalizers-tmdb";

const BASE_URL = "https://api.themoviedb.org/3";
const TMDB_DISCOVERY_PAGES = 3;

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

const discoverTmdbCollection = async (path: string, pages = TMDB_DISCOVERY_PAGES) => {
  if (!hasTmdb) {
    return [];
  }

  const payloads = await Promise.all(
    Array.from({ length: pages }, (_, index) => fetchTmdb(`${path}?language=en-US&page=${index + 1}`)),
  );

  return payloads.flatMap((payload) => parseTmdbList(payload).results.map(normalizeTmdbMovie));
};

export const discoverTmdbNowShowing = async () => {
  return discoverTmdbCollection("/movie/now_playing");
};

export const discoverTmdbUpcoming = async () => {
  return discoverTmdbCollection("/movie/upcoming");
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
