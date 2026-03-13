import "server-only";

import type { Cinema, Movie, Series, Showtime } from "@/domain/types";
import { demoCinemas, demoMovies, demoShowtimes } from "@/lib/dev-seed-data";
import { hasDatabase } from "@/lib/env";
import { listCinemas as listCinemasFromDb } from "@/services/db/repositories/cinema-repository";
import { listMovies as listMoviesFromDb } from "@/services/db/repositories/movie-repository";
import { listSeries as listSeriesFromDb } from "@/services/db/repositories/series-repository";
import { listShowtimes as listShowtimesFromDb } from "@/services/db/repositories/showtime-repository";

const fallbackIfEmpty = <T>(items: T[], fallback: T[]): T[] => (items.length ? items : fallback);

export const loadCinemasCatalog = async (): Promise<Cinema[]> => {
  if (!hasDatabase) {
    return demoCinemas;
  }

  try {
    const items = await listCinemasFromDb();
    return fallbackIfEmpty(items, demoCinemas);
  } catch {
    return demoCinemas;
  }
};

export const loadMoviesCatalog = async (): Promise<Movie[]> => {
  if (!hasDatabase) {
    return demoMovies;
  }

  try {
    const items = await listMoviesFromDb();
    return fallbackIfEmpty(items, demoMovies);
  } catch {
    return demoMovies;
  }
};

export const loadSeriesCatalog = async (): Promise<Series[]> => {
  if (!hasDatabase) {
    return [];
  }

  try {
    return await listSeriesFromDb();
  } catch {
    return [];
  }
};

export const loadShowtimesCatalog = async (): Promise<Showtime[]> => {
  if (!hasDatabase) {
    return demoShowtimes;
  }

  try {
    const items = await listShowtimesFromDb();
    return fallbackIfEmpty(items, demoShowtimes);
  } catch {
    return demoShowtimes;
  }
};
