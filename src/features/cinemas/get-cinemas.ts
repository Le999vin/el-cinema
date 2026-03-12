import { filterCinemas, sortCinemas, createCinemaSearchFilter, createCityFilter } from "@/domain/logic/cinema";
import type { CinemaDetails, CinemaSummary } from "@/domain/types";
import { loadCinemasCatalog, loadMoviesCatalog, loadShowtimesCatalog } from "@/features/catalog/load-catalog";

export interface CinemaListQuery {
  search?: string;
  city?: string;
  sort?: "name" | "showtimes";
}

export const getCinemas = async (query: CinemaListQuery = {}): Promise<CinemaSummary[]> => {
  const [cinemas, showtimes] = await Promise.all([loadCinemasCatalog(), loadShowtimesCatalog()]);

  const filters = [createCinemaSearchFilter(query.search ?? "")];
  if (query.city) {
    filters.push(createCityFilter(query.city));
  }

  const filtered = filterCinemas(cinemas, filters);
  const sorted = sortCinemas(filtered, query.sort ?? "name");

  return sorted.map((cinema) => {
    const cinemaShowtimes = showtimes.filter((showtime) => showtime.cinemaId === cinema.id);
    const movieCount = new Set(cinemaShowtimes.map((showtime) => showtime.movieId)).size;

    return {
      id: cinema.id,
      name: cinema.name,
      address: cinema.address,
      city: cinema.city,
      district: cinema.district,
      websiteUrl: cinema.websiteUrl,
      movieCount,
      showtimeCount: cinemaShowtimes.length,
    };
  });
};

export const getCinemaDetails = async (cinemaId: string, userFavouriteCinemaIds: string[] = []): Promise<CinemaDetails | null> => {
  const [cinemas, movies, showtimes] = await Promise.all([
    loadCinemasCatalog(),
    loadMoviesCatalog(),
    loadShowtimesCatalog(),
  ]);

  const cinema = cinemas.find((item) => item.id === cinemaId);
  if (!cinema) {
    return null;
  }

  const cinemaShowtimes = showtimes
    .filter((showtime) => showtime.cinemaId === cinema.id)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  const movieIds = [...new Set(cinemaShowtimes.map((showtime) => showtime.movieId))];
  const cinemaMovies = movieIds
    .map((movieId) => movies.find((movie) => movie.id === movieId))
    .filter((movie): movie is NonNullable<typeof movie> => Boolean(movie))
    .map((movie) => ({
      id: movie.id,
      tmdbId: movie.tmdbId,
      title: movie.title,
      genres: movie.genres,
      posterUrl: movie.posterUrl,
      releaseDate: movie.releaseDate,
      runtimeMinutes: movie.runtimeMinutes,
    }));

  return {
    ...cinema,
    showtimes: cinemaShowtimes,
    movies: cinemaMovies,
    isFavourite: userFavouriteCinemaIds.includes(cinema.id),
  };
};

