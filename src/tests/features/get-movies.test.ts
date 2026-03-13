import { afterEach, describe, expect, it, vi } from "vitest";

import { demoMovies } from "@/lib/dev-seed-data";

vi.mock("@/lib/env", () => ({
  hasDatabase: true,
}));

vi.mock("@/features/catalog/enrich-catalog", () => ({
  ensureMovieSearchResults: vi.fn(),
  ensureMovieDetailsFresh: vi.fn(),
}));

vi.mock("@/services/db/repositories/movie-repository", () => ({
  queryMovies: vi.fn(),
}));

import { ensureMovieSearchResults } from "@/features/catalog/enrich-catalog";
import { getMovies } from "@/features/movies/get-movies";
import { queryMovies } from "@/services/db/repositories/movie-repository";

describe("getMovies", () => {
  const mockedQueryMovies = vi.mocked(queryMovies);
  const mockedEnsureMovieSearchResults = vi.mocked(ensureMovieSearchResults);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("enriches from TMDb for free-text searches before querying the DB-backed catalog", async () => {
    mockedQueryMovies.mockResolvedValue([demoMovies[0]]);

    const result = await getMovies({ search: "dune", sort: "release-date" });

    expect(mockedEnsureMovieSearchResults).toHaveBeenCalledWith("dune");
    expect(mockedQueryMovies).toHaveBeenCalledWith({ search: "dune", sort: "release-date" });
    expect(result).toEqual([
      {
        id: demoMovies[0].id,
        tmdbId: demoMovies[0].tmdbId,
        title: demoMovies[0].title,
        genres: demoMovies[0].genres,
        posterUrl: demoMovies[0].posterUrl,
        releaseDate: demoMovies[0].releaseDate,
        runtimeMinutes: demoMovies[0].runtimeMinutes,
      },
    ]);
  });

  it("returns the general DB-backed list when search is empty", async () => {
    mockedQueryMovies.mockResolvedValue(demoMovies);

    const result = await getMovies({ search: "", sort: "release-date" });

    expect(mockedEnsureMovieSearchResults).not.toHaveBeenCalled();
    expect(mockedQueryMovies).toHaveBeenCalledWith({ search: "", sort: "release-date" });
    expect(result).toHaveLength(demoMovies.length);
    expect(result[0].title).toBe("Dune: Part Two");
  });

  it("passes genre-only filtering through to the repository query", async () => {
    mockedQueryMovies.mockResolvedValue([demoMovies[1], demoMovies[5]]);

    const result = await getMovies({ genres: ["History"], sort: "title" });

    expect(mockedQueryMovies).toHaveBeenCalledWith({ genres: ["History"], sort: "title" });
    expect(result.map((movie) => movie.title)).toEqual(["Oppenheimer", "The Zone of Interest"]);
  });

  it("passes search and genre together through to the repository query", async () => {
    mockedQueryMovies.mockResolvedValue([demoMovies[2]]);

    const result = await getMovies({ search: "science", genres: ["Drama"], sort: "release-date" });

    expect(mockedEnsureMovieSearchResults).toHaveBeenCalledWith("science");
    expect(mockedQueryMovies).toHaveBeenCalledWith({ search: "science", genres: ["Drama"], sort: "release-date" });
    expect(result.map((movie) => movie.title)).toEqual(["Poor Things"]);
  });

  it("preserves repository ordering after filtering", async () => {
    mockedQueryMovies.mockResolvedValue([demoMovies[0], demoMovies[2]]);

    const result = await getMovies({ search: "science", sort: "release-date" });

    expect(result.map((movie) => movie.title)).toEqual(["Dune: Part Two", "Poor Things"]);
  });

  it("returns an empty list when no movie matches", async () => {
    mockedQueryMovies.mockResolvedValue([]);

    const result = await getMovies({ search: "no-match", sort: "release-date" });

    expect(result).toEqual([]);
  });
});
