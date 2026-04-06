import { computeDashboardStats } from "@/domain/logic/dashboard";
import type { Cinema, DashboardStats, Movie, Showtime, UserRating } from "@/domain/types";
import { loadCinemasCatalog, loadMoviesCatalog, loadShowtimesCatalog } from "@/features/catalog/load-catalog";
import { hasDatabase } from "@/lib/env";
import { getUserProfile } from "@/services/db/repositories/user-repository";

export interface DashboardShowtimeRow {
  showtime: Showtime;
  movie: Movie;
  cinema: Cinema;
}

export interface DashboardData {
  stats: DashboardStats;
  watchlist: Movie[];
  seen: Movie[];
  favouriteCinemas: Cinema[];
  recentRatings: Array<{ movie: Movie; rating: UserRating }>;
  upcomingWatchlistShowtimes: DashboardShowtimeRow[];
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
      favouriteCinemas: [],
      recentRatings: [],
      upcomingWatchlistShowtimes: [],
    };
  }

  const [profile, movies, cinemas, showtimes] = await Promise.all([
    getUserProfile(userId),
    loadMoviesCatalog(),
    loadCinemasCatalog(),
    loadShowtimesCatalog(),
  ]);

  if (!profile) {
    return {
      stats: emptyStats,
      watchlist: [],
      seen: [],
      favouriteCinemas: [],
      recentRatings: [],
      upcomingWatchlistShowtimes: [],
    };
  }

  const movieMap = new Map(movies.map((movie) => [movie.id, movie]));
  const cinemaMap = new Map(cinemas.map((cinema) => [cinema.id, cinema]));

  const watchlist = profile.watchlistMovieIds
    .map((movieId) => movieMap.get(movieId))
    .filter((movie): movie is Movie => Boolean(movie));

  const seen = profile.seenMovieIds
    .map((movieId) => movieMap.get(movieId))
    .filter((movie): movie is Movie => Boolean(movie));

  const favouriteCinemas = profile.favouriteCinemaIds
    .map((cinemaId) => cinemaMap.get(cinemaId))
    .filter((cinema): cinema is Cinema => Boolean(cinema));

  const recentRatings = [...profile.ratings]
    .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime())
    .map((rating) => ({
      rating,
      movie: movieMap.get(rating.movieId),
    }))
    .filter((entry): entry is { movie: Movie; rating: UserRating } => Boolean(entry.movie))
    .slice(0, 5);

  const upcomingWatchlistShowtimes = showtimes
    .filter((showtime) => showtime.startsAt >= new Date() && profile.watchlistMovieIds.includes(showtime.movieId))
    .map((showtime) => ({
      showtime,
      movie: movieMap.get(showtime.movieId),
      cinema: cinemaMap.get(showtime.cinemaId),
    }))
    .filter((entry): entry is DashboardShowtimeRow => Boolean(entry.movie && entry.cinema))
    .sort((left, right) => left.showtime.startsAt.getTime() - right.showtime.startsAt.getTime())
    .slice(0, 6);

  return {
    stats: computeDashboardStats(profile, movies, showtimes, new Date()),
    watchlist,
    seen,
    favouriteCinemas,
    recentRatings,
    upcomingWatchlistShowtimes,
  };
};
