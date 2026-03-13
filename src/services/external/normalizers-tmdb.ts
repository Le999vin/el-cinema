import { z } from "zod";

const imageBase = "https://image.tmdb.org/t/p";

const tmdbGenreSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

const tmdbMovieSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  overview: z.string().nullable().optional(),
  genre_ids: z.array(z.number().int()).optional(),
  genres: z.array(tmdbGenreSchema).optional(),
  runtime: z.number().int().nullable().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  release_date: z.string().nullable().optional(),
  vote_average: z.number().nullable().optional(),
});

const tmdbSeriesSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  overview: z.string().nullable().optional(),
  genre_ids: z.array(z.number().int()).optional(),
  genres: z.array(tmdbGenreSchema).optional(),
  episode_run_time: z.array(z.number().int()).optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  first_air_date: z.string().nullable().optional(),
  vote_average: z.number().nullable().optional(),
  number_of_seasons: z.number().int().nullable().optional(),
  number_of_episodes: z.number().int().nullable().optional(),
});

const buildTmdbListSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    results: z.array(itemSchema),
  });

const tmdbMovieListSchema = buildTmdbListSchema(tmdbMovieSchema);
const tmdbSeriesListSchema = buildTmdbListSchema(tmdbSeriesSchema);

export const genreMap: Record<number, string> = {
  12: "Adventure",
  14: "Fantasy",
  16: "Animation",
  18: "Drama",
  27: "Horror",
  28: "Action",
  35: "Comedy",
  36: "History",
  37: "Western",
  53: "Thriller",
  80: "Crime",
  99: "Documentary",
  878: "Science Fiction",
  9648: "Mystery",
  10402: "Music",
  10749: "Romance",
  10751: "Family",
  10752: "War",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
};

const mapGenreIds = (ids: readonly number[] | undefined): string[] =>
  ids?.map((id) => genreMap[id]).filter((value): value is string => Boolean(value)) ?? [];

const buildImageUrl = (path: string | null | undefined, size: string) => (path ? `${imageBase}/${size}${path}` : null);

const firstRuntime = (runtime: readonly number[] | undefined) => runtime?.find((value) => value > 0) ?? null;

export const normalizeTmdbMovie = (movie: z.infer<typeof tmdbMovieSchema>) => ({
  tmdbId: movie.id,
  title: movie.title,
  overview: movie.overview || "Overview unavailable.",
  genres: movie.genres?.length ? movie.genres.map((genre) => genre.name) : mapGenreIds(movie.genre_ids),
  runtimeMinutes: movie.runtime ?? null,
  posterUrl: buildImageUrl(movie.poster_path, "w780"),
  backdropUrl: buildImageUrl(movie.backdrop_path, "w1280"),
  releaseDate: movie.release_date ?? null,
  voteAverage: movie.vote_average ?? null,
});

export const normalizeTmdbSeries = (entry: z.infer<typeof tmdbSeriesSchema>) => ({
  tmdbId: entry.id,
  name: entry.name,
  overview: entry.overview || "Overview unavailable.",
  genres: entry.genres?.length ? entry.genres.map((genre) => genre.name) : mapGenreIds(entry.genre_ids),
  episodeRuntimeMinutes: firstRuntime(entry.episode_run_time),
  posterUrl: buildImageUrl(entry.poster_path, "w780"),
  backdropUrl: buildImageUrl(entry.backdrop_path, "w1280"),
  firstAirDate: entry.first_air_date ?? null,
  voteAverage: entry.vote_average ?? null,
  numberOfSeasons: entry.number_of_seasons ?? null,
  numberOfEpisodes: entry.number_of_episodes ?? null,
});

export const parseTmdbMovieList = (payload: unknown) => tmdbMovieListSchema.parse(payload);
export const parseTmdbMovie = (payload: unknown) => tmdbMovieSchema.parse(payload);
export const parseTmdbSeriesList = (payload: unknown) => tmdbSeriesListSchema.parse(payload);
export const parseTmdbSeries = (payload: unknown) => tmdbSeriesSchema.parse(payload);
