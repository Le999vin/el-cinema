import type { Movie } from "@/domain/types";

export type MovieSortMode = "title" | "release-date" | "runtime";

export const createGenreFilter = (genres: readonly string[]) => {
  if (!genres.length) {
    return () => true;
  }

  const selected = new Set(genres.map((genre) => genre.toLowerCase()));

  return (movie: Movie): boolean => movie.genres.some((genre) => selected.has(genre.toLowerCase()));
};

export const createMovieSearchFilter = (query: string) => {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return () => true;
  }

  return (movie: Movie): boolean =>
    [movie.title, movie.overview, movie.genres.join(" ")].join(" ").toLowerCase().includes(normalized);
};

export const sortMovies = (movies: readonly Movie[], mode: MovieSortMode): Movie[] => {
  const copy = [...movies];

  if (mode === "title") {
    return copy.sort((a, b) => a.title.localeCompare(b.title, "en"));
  }

  if (mode === "release-date") {
    return copy.sort((a, b) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? ""));
  }

  return copy.sort((a, b) => (b.runtimeMinutes ?? 0) - (a.runtimeMinutes ?? 0));
};

