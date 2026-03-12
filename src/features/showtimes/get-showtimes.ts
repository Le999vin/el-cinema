import { createDateRangeFilter, createTimeWindowFilter, filterShowtimes, sortShowtimesByStart } from "@/domain/logic/showtime";
import type { Cinema, Movie, Showtime } from "@/domain/types";
import { loadCinemasCatalog, loadMoviesCatalog, loadShowtimesCatalog } from "@/features/catalog/load-catalog";

export interface ShowtimeRow {
  showtime: Showtime;
  movie: Movie;
  cinema: Cinema;
}

export interface ShowtimesQuery {
  mode?: "today" | "tomorrow" | "week";
  movieId?: string;
  cinemaId?: string;
  timeStart?: number;
  timeEnd?: number;
}

export const getShowtimeRows = async (query: ShowtimesQuery = {}, now = new Date()): Promise<ShowtimeRow[]> => {
  const [showtimes, cinemas, movies] = await Promise.all([
    loadShowtimesCatalog(),
    loadCinemasCatalog(),
    loadMoviesCatalog(),
  ]);

  const filters = [
    createDateRangeFilter(query.mode ?? "today", now),
    createTimeWindowFilter(query.timeStart ?? null, query.timeEnd ?? null),
    query.movieId ? (showtime: Showtime) => showtime.movieId === query.movieId : () => true,
    query.cinemaId ? (showtime: Showtime) => showtime.cinemaId === query.cinemaId : () => true,
  ];

  const selected = sortShowtimesByStart(filterShowtimes(showtimes, filters));
  const movieMap = new Map(movies.map((movie) => [movie.id, movie]));
  const cinemaMap = new Map(cinemas.map((cinema) => [cinema.id, cinema]));

  return selected
    .map((showtime) => ({
      showtime,
      movie: movieMap.get(showtime.movieId),
      cinema: cinemaMap.get(showtime.cinemaId),
    }))
    .filter(
      (item): item is { showtime: Showtime; movie: Movie; cinema: Cinema } => Boolean(item.movie && item.cinema),
    );
};

