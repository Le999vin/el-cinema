import { demoCinemas, demoMovies } from "@/lib/dev-seed-data";
import { hasDatabase, hasGooglePlaces, hasTmdb } from "@/lib/env";
import { upsertCinemas } from "@/services/db/repositories/cinema-repository";
import { upsertMovies } from "@/services/db/repositories/movie-repository";
import { fetchZurichCinemasFromGoogle } from "@/services/external/google-places";
import { discoverTmdbNowShowing, discoverTmdbUpcoming } from "@/services/external/tmdb";

export const syncCinemas = async () => {
  if (!hasDatabase) {
    return { synced: 0, source: "none", reason: "DATABASE_URL missing" };
  }

  const payload = hasGooglePlaces ? await fetchZurichCinemasFromGoogle() : demoCinemas;
  const synced = await upsertCinemas(payload);

  return {
    synced,
    source: hasGooglePlaces ? "google-places" : "demo-fallback",
  };
};

export const syncMovies = async () => {
  if (!hasDatabase) {
    return { synced: 0, source: "none", reason: "DATABASE_URL missing" };
  }

  const payload = hasTmdb
    ? [...(await discoverTmdbNowShowing()), ...(await discoverTmdbUpcoming())]
    : demoMovies;

  const deduped = [...new Map(payload.map((movie) => [movie.tmdbId, movie])).values()];
  const synced = await upsertMovies(deduped);

  return {
    synced,
    source: hasTmdb ? "tmdb" : "demo-fallback",
  };
};
