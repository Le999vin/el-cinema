import { createGenreFilter, createMovieSearchFilter, sortMovies } from "@/domain/logic/movie";
import type { MovieDetails, MovieSummary, UserRating } from "@/domain/types";
import { loadCinemasCatalog, loadMoviesCatalog, loadShowtimesCatalog } from "@/features/catalog/load-catalog";

export interface MoviesQuery {
  search?: string;
  genres?: string[];
  sort?: "title" | "release-date" | "runtime";
}

interface UserMovieContext {
  watchlistMovieIds?: string[];
  seenMovieIds?: string[];
  ratings?: UserRating[];
}

export const getMovies = async (query: MoviesQuery = {}): Promise<MovieSummary[]> => {
  const movies = await loadMoviesCatalog();

  const filters = [createMovieSearchFilter(query.search ?? ""), createGenreFilter(query.genres ?? [])];

  const filtered = movies.filter((movie) => filters.every((filter) => filter(movie)));
  const sorted = sortMovies(filtered, query.sort ?? "title");

  return sorted.map((movie) => ({
    id: movie.id,
    tmdbId: movie.tmdbId,
    title: movie.title,
    genres: movie.genres,
    posterUrl: movie.posterUrl,
    releaseDate: movie.releaseDate,
    runtimeMinutes: movie.runtimeMinutes,
  }));
};

export const getMovieDetails = async (
  movieId: string,
  context: UserMovieContext = {},
): Promise<MovieDetails | null> => {
  const [movies, cinemas, showtimes] = await Promise.all([
    loadMoviesCatalog(),
    loadCinemasCatalog(),
    loadShowtimesCatalog(),
  ]);

  const movie = movies.find((item) => item.id === movieId);
  if (!movie) {
    return null;
  }

  const movieShowtimes = showtimes
    .filter((showtime) => showtime.movieId === movie.id)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  const cinemaIds = [...new Set(movieShowtimes.map((showtime) => showtime.cinemaId))];
  const movieCinemas = cinemaIds
    .map((cinemaId) => cinemas.find((cinema) => cinema.id === cinemaId))
    .filter((cinema): cinema is NonNullable<typeof cinema> => Boolean(cinema))
    .map((cinema) => ({
      id: cinema.id,
      name: cinema.name,
      address: cinema.address,
      city: cinema.city,
      district: cinema.district,
      websiteUrl: cinema.websiteUrl,
      movieCount: 1,
      showtimeCount: movieShowtimes.filter((showtime) => showtime.cinemaId === cinema.id).length,
    }));

  return {
    ...movie,
    showtimes: movieShowtimes,
    cinemas: movieCinemas,
    userRating: context.ratings?.find((rating) => rating.movieId === movie.id) ?? null,
    onWatchlist: context.watchlistMovieIds?.includes(movie.id) ?? false,
    seen: context.seenMovieIds?.includes(movie.id) ?? false,
  };
};

