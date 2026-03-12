import { computeDashboardStats } from "@/domain/logic/dashboard";
import type { DashboardStats, Movie } from "@/domain/types";
import { loadMoviesCatalog, loadShowtimesCatalog } from "@/features/catalog/load-catalog";
import { hasDatabase } from "@/lib/env";
import { getUserProfile } from "@/services/db/repositories/user-repository";

export interface DashboardData {
  stats: DashboardStats;
  watchlist: Movie[];
  seen: Movie[];
}

const emptyStats: DashboardStats = {
  watchlistCount: 0,
  seenCount: 0,
  ratingsCount: 0,
  favouriteCinemaCount: 0,
  topGenres: [],
  totalUpcomingShowtimes: 0,
};

export const getDashboardData = async (userId: string): Promise<DashboardData> => {
  if (!hasDatabase) {
    return {
      stats: emptyStats,
      watchlist: [],
      seen: [],
    };
  }

  const [profile, movies, showtimes] = await Promise.all([
    getUserProfile(userId),
    loadMoviesCatalog(),
    loadShowtimesCatalog(),
  ]);

  if (!profile) {
    return {
      stats: emptyStats,
      watchlist: [],
      seen: [],
    };
  }

  const movieMap = new Map(movies.map((movie) => [movie.id, movie]));

  const watchlist = profile.watchlistMovieIds
    .map((movieId) => movieMap.get(movieId))
    .filter((movie): movie is Movie => Boolean(movie));

  const seen = profile.seenMovieIds
    .map((movieId) => movieMap.get(movieId))
    .filter((movie): movie is Movie => Boolean(movie));

  return {
    stats: computeDashboardStats(profile, movies, showtimes, new Date()),
    watchlist,
    seen,
  };
};

