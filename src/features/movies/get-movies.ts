import { createGenreFilter, createMovieSearchFilter, sortMovies } from "@/domain/logic/movie";
import type { MovieDetails, MovieSummary, UserRating } from "@/domain/types";
import { ensureMovieDetailsFresh, ensureMovieSearchResults } from "@/features/catalog/enrich-catalog";
import { loadCinemasCatalog, loadMoviesCatalog, loadShowtimesCatalog } from "@/features/catalog/load-catalog";
import { hasDatabase } from "@/lib/env";
import { queryMovies } from "@/services/db/repositories/movie-repository";

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
  if (hasDatabase) {
    try {
      if (query.search?.trim()) {
        await ensureMovieSearchResults(query.search);
      }

      const movies = await queryMovies(query);
      if (movies.length || query.search?.trim() || query.genres?.length) {
        return movies.map((movie) => ({
          id: movie.id,
          tmdbId: movie.tmdbId,
          title: movie.title,
          genres: movie.genres,
          posterUrl: movie.posterUrl,
          releaseDate: movie.releaseDate,
          runtimeMinutes: movie.runtimeMinutes,
        }));
      }
    } catch (error) {
      console.error("Movie query failed; falling back to catalog loader.", error);
    }
  }

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
  const loadFallbackMovieDetails = async () => {
    const [movies, cinemas, showtimes] = await Promise.all([loadMoviesCatalog(), loadCinemasCatalog(), loadShowtimesCatalog()]);
    return {
      movie: movies.find((item) => item.id === movieId) ?? null,
      cinemas,
      showtimes,
    };
  };

  type FallbackMovieDetails = Awaited<ReturnType<typeof loadFallbackMovieDetails>>;

  let movie: FallbackMovieDetails["movie"];
  let cinemas: FallbackMovieDetails["cinemas"];
  let showtimes: FallbackMovieDetails["showtimes"];

  if (hasDatabase) {
    try {
      ({ movie, cinemas, showtimes } = await Promise.all([
        ensureMovieDetailsFresh(movieId),
        loadCinemasCatalog(),
        loadShowtimesCatalog(),
      ]).then(([resolvedMovie, resolvedCinemas, resolvedShowtimes]) => ({
        movie: resolvedMovie,
        cinemas: resolvedCinemas,
        showtimes: resolvedShowtimes,
      })));
    } catch (error) {
      console.error("Movie details query failed; falling back to catalog loader.", error);
      ({ movie, cinemas, showtimes } = await loadFallbackMovieDetails());
    }
  } else {
    ({ movie, cinemas, showtimes } = await loadFallbackMovieDetails());
  }

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
      region: cinema.region,
      district: cinema.district,
      websiteUrl: cinema.websiteUrl,
      rating: cinema.rating,
      googleMapsUri: cinema.googleMapsUri,
      types: cinema.types,
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
