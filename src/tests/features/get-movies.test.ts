import { afterEach, describe, expect, it, vi } from "vitest";

import { demoMovies } from "@/lib/dev-seed-data";

vi.mock("@/features/catalog/load-catalog", () => ({
  loadMoviesCatalog: vi.fn(),
}));

import { loadMoviesCatalog } from "@/features/catalog/load-catalog";
import { getMovies } from "@/features/movies/get-movies";

describe("getMovies", () => {
  const mockedLoadMoviesCatalog = vi.mocked(loadMoviesCatalog);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns only title matches for free-text search", async () => {
    mockedLoadMoviesCatalog.mockResolvedValue(demoMovies);

    const result = await getMovies({ search: "dune", sort: "release-date" });

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Dune: Part Two");
  });

  it("returns the general list when search is empty", async () => {
    mockedLoadMoviesCatalog.mockResolvedValue(demoMovies);

    const result = await getMovies({ search: "", sort: "release-date" });

    expect(result).toHaveLength(demoMovies.length);
    expect(result[0].title).toBe("Challengers");
  });

  it("supports genre-only filtering", async () => {
    mockedLoadMoviesCatalog.mockResolvedValue(demoMovies);

    const result = await getMovies({ genres: ["History"], sort: "title" });

    expect(result.map((movie) => movie.title)).toEqual([
      "Oppenheimer",
      "The Zone of Interest",
    ]);
  });

  it("applies search and genre together", async () => {
    mockedLoadMoviesCatalog.mockResolvedValue(demoMovies);

    const result = await getMovies({ search: "science", genres: ["Drama"], sort: "release-date" });

    expect(result.map((movie) => movie.title)).toEqual(["Poor Things"]);
  });

  it("keeps sorting after filtering", async () => {
    mockedLoadMoviesCatalog.mockResolvedValue(demoMovies);

    const result = await getMovies({ search: "science", sort: "release-date" });

    expect(result.map((movie) => movie.title)).toEqual([
      "Dune: Part Two",
      "Poor Things",
    ]);
  });

  it("returns an empty list when no movie matches", async () => {
    mockedLoadMoviesCatalog.mockResolvedValue(demoMovies);

    const result = await getMovies({ search: "no-match", sort: "release-date" });

    expect(result).toEqual([]);
  });
});
