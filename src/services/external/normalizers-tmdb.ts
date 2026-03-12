import { z } from "zod";

const tmdbMovieSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  overview: z.string(),
  genre_ids: z.array(z.number().int()).optional(),
  genres: z.array(z.object({ id: z.number().int(), name: z.string() })).optional(),
  runtime: z.number().int().nullable().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  release_date: z.string().nullable().optional(),
  vote_average: z.number().nullable().optional(),
});

const tmdbListSchema = z.object({
  results: z.array(tmdbMovieSchema),
});

const imageBase = "https://image.tmdb.org/t/p";

export const genreMap: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

const mapGenreIds = (ids: readonly number[] | undefined): string[] =>
  ids?.map((id) => genreMap[id]).filter((value): value is string => Boolean(value)) ?? [];

export const normalizeTmdbMovie = (movie: z.infer<typeof tmdbMovieSchema>) => ({
  tmdbId: movie.id,
  title: movie.title,
  overview: movie.overview || "Overview unavailable.",
  genres: movie.genres?.length
    ? movie.genres.map((genre) => genre.name)
    : mapGenreIds(movie.genre_ids),
  runtimeMinutes: movie.runtime ?? null,
  posterUrl: movie.poster_path ? `${imageBase}/w780${movie.poster_path}` : null,
  backdropUrl: movie.backdrop_path ? `${imageBase}/w1280${movie.backdrop_path}` : null,
  releaseDate: movie.release_date ?? null,
  voteAverage: movie.vote_average ?? null,
});

export const parseTmdbList = (payload: unknown) => tmdbListSchema.parse(payload);
export const parseTmdbMovie = (payload: unknown) => tmdbMovieSchema.parse(payload);

