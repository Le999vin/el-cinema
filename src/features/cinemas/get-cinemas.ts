import type { Cinema, CinemaDetails, CinemaSummary } from "@/domain/types";
import { loadCinemasCatalog, loadMoviesCatalog, loadShowtimesCatalog } from "@/features/catalog/load-catalog";
import { ensureCinemaDetailsFresh, ensureCinemaSearchResults } from "@/features/cinemas/enrich-cinemas";
import { hasDatabase } from "@/lib/env";
import { buildCinemaSearchHaystack, buildCinemaSearchVariants } from "@/lib/cinema-search";
import { listCinemaActivity, queryCinemas } from "@/services/db/repositories/cinema-repository";

export interface CinemaListQuery {
  search?: string;
  city?: string;
  sort?: "name" | "showtimes";
}

interface CinemaPageData {
  summaries: CinemaSummary[];
  mapCinemas: Cinema[];
}

const buildCinemaSearchMatcher = (search: string) => {
  const variants = buildCinemaSearchVariants(search);
  if (!variants.length) {
    return () => true;
  }

  return (cinema: Cinema) => {
    const haystack = buildCinemaSearchHaystack(
      cinema.name,
      cinema.address,
      cinema.city,
      cinema.district ?? "",
      cinema.types.join(" "),
      cinema.chain ?? "",
    );

    return variants.some((variant) => haystack.includes(variant));
  };
};

const buildCityMatcher = (city: string) => {
  const variants = buildCinemaSearchVariants(city);
  if (!variants.length) {
    return () => true;
  }

  return (cinema: Cinema) => {
    const cityVariants = new Set(buildCinemaSearchVariants(cinema.city));
    return variants.some((variant) => cityVariants.has(variant));
  };
};

const sortCinemaRows = (
  cinemas: readonly Cinema[],
  activityByCinemaId: ReadonlyMap<string, { showtimeCount: number }>,
  mode: NonNullable<CinemaListQuery["sort"]>,
) => {
  const copy = [...cinemas];

  if (mode === "showtimes") {
    return copy.sort((left, right) => {
      const leftCount = activityByCinemaId.get(left.id)?.showtimeCount ?? 0;
      const rightCount = activityByCinemaId.get(right.id)?.showtimeCount ?? 0;

      if (rightCount !== leftCount) {
        return rightCount - leftCount;
      }

      return left.name.localeCompare(right.name, "en");
    });
  }

  return copy.sort((left, right) => left.name.localeCompare(right.name, "en"));
};

const buildCinemaSummaries = (
  cinemas: readonly Cinema[],
  activityByCinemaId: ReadonlyMap<string, { showtimeCount: number; movieCount: number }>,
): CinemaSummary[] =>
  cinemas.map((cinema) => {
    const activity = activityByCinemaId.get(cinema.id);

    return {
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
      movieCount: activity?.movieCount ?? 0,
      showtimeCount: activity?.showtimeCount ?? 0,
    };
  });

const buildFallbackCinemaPageData = async (query: CinemaListQuery): Promise<CinemaPageData> => {
  const [cinemas, showtimes] = await Promise.all([loadCinemasCatalog(), loadShowtimesCatalog()]);

  const filtered = cinemas.filter((cinema) => {
    return buildCinemaSearchMatcher(query.search ?? "")(cinema) && buildCityMatcher(query.city ?? "")(cinema);
  });

  const activityByCinemaId = new Map(
    filtered.map((cinema) => {
      const cinemaShowtimes = showtimes.filter((showtime) => showtime.cinemaId === cinema.id);
      return [
        cinema.id,
        {
          showtimeCount: cinemaShowtimes.length,
          movieCount: new Set(cinemaShowtimes.map((showtime) => showtime.movieId)).size,
        },
      ] as const;
    }),
  );

  const sorted = sortCinemaRows(filtered, activityByCinemaId, query.sort ?? "name");

  return {
    summaries: buildCinemaSummaries(sorted, activityByCinemaId),
    mapCinemas: sorted,
  };
};

const buildDbCinemaPageData = async (query: CinemaListQuery): Promise<CinemaPageData | null> => {
  let cinemas = await queryCinemas({ search: query.search, city: query.city });

  if (!cinemas.length && query.search?.trim()) {
    await ensureCinemaSearchResults(query.search);
    cinemas = await queryCinemas({ search: query.search, city: query.city });
  }

  if (!cinemas.length) {
    const hasFilters = Boolean(query.search?.trim() || query.city?.trim());

    if (hasFilters) {
      const catalogProbe = await queryCinemas({ limit: 1 });
      if (catalogProbe.length) {
        return { summaries: [], mapCinemas: [] };
      }
    } else {
      return null;
    }
  }

  if (!cinemas.length) {
    return null;
  }

  const activityRows = await listCinemaActivity(cinemas.map((cinema) => cinema.id));
  const activityByCinemaId = new Map(
    activityRows.map((row) => [
      row.cinemaId,
      { showtimeCount: row.showtimeCount, movieCount: row.movieCount },
    ]),
  );

  const sorted = sortCinemaRows(cinemas, activityByCinemaId, query.sort ?? "name");

  return {
    summaries: buildCinemaSummaries(sorted, activityByCinemaId),
    mapCinemas: sorted,
  };
};

export const getCinemasPageData = async (query: CinemaListQuery = {}): Promise<CinemaPageData> => {
  if (hasDatabase) {
    try {
      const dbData = await buildDbCinemaPageData(query);
      if (dbData) {
        return dbData;
      }
    } catch (error) {
      console.error("Cinema query failed; falling back to catalog loader.", error);
    }
  }

  return buildFallbackCinemaPageData(query);
};

export const getCinemas = async (query: CinemaListQuery = {}): Promise<CinemaSummary[]> => {
  const { summaries } = await getCinemasPageData(query);
  return summaries;
};

export const getCinemaDetails = async (cinemaId: string, userFavouriteCinemaIds: string[] = []): Promise<CinemaDetails | null> => {
  const loadFallbackCinemaDetails = async () => {
    const [cinemas, movies, showtimes] = await Promise.all([
      loadCinemasCatalog(),
      loadMoviesCatalog(),
      loadShowtimesCatalog(),
    ]);

    return {
      cinema: cinemas.find((item) => item.id === cinemaId) ?? null,
      movies,
      showtimes,
    };
  };

  type FallbackCinemaDetails = Awaited<ReturnType<typeof loadFallbackCinemaDetails>>;

  let cinema: FallbackCinemaDetails["cinema"];
  let movies: FallbackCinemaDetails["movies"];
  let showtimes: FallbackCinemaDetails["showtimes"];

  if (hasDatabase) {
    try {
      ({ cinema, movies, showtimes } = await Promise.all([
        ensureCinemaDetailsFresh(cinemaId),
        loadMoviesCatalog(),
        loadShowtimesCatalog(),
      ]).then(([resolvedCinema, resolvedMovies, resolvedShowtimes]) => ({
        cinema: resolvedCinema,
        movies: resolvedMovies,
        showtimes: resolvedShowtimes,
      })));
    } catch (error) {
      console.error("Cinema details query failed; falling back to catalog loader.", error);
      ({ cinema, movies, showtimes } = await loadFallbackCinemaDetails());
    }
  } else {
    ({ cinema, movies, showtimes } = await loadFallbackCinemaDetails());
  }

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
