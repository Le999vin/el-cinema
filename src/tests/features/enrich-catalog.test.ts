import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

import { demoMovies } from "@/lib/dev-seed-data";

vi.mock("@/lib/env", () => ({
  hasDatabase: true,
  hasTmdb: true,
}));

vi.mock("@/services/db/repositories/movie-repository", () => ({
  getMovieById: vi.fn(),
  queryMovies: vi.fn(),
  upsertMovies: vi.fn(),
}));

vi.mock("@/services/db/repositories/series-repository", () => ({
  getSeriesById: vi.fn(),
  querySeries: vi.fn(),
  upsertSeries: vi.fn(),
}));

vi.mock("@/services/external/tmdb", () => ({
  searchTmdbMovies: vi.fn(),
  searchTmdbSeries: vi.fn(),
  fetchTmdbMovieDetails: vi.fn(),
  fetchTmdbSeriesDetails: vi.fn(),
}));

import {
  ensureMovieDetailsFresh,
  ensureMovieSearchResults,
  ensureSeriesDetailsFresh,
  ensureSeriesSearchResults,
} from "@/features/catalog/enrich-catalog";
import { getMovieById, queryMovies, upsertMovies } from "@/services/db/repositories/movie-repository";
import { getSeriesById, querySeries, upsertSeries } from "@/services/db/repositories/series-repository";
import {
  fetchTmdbMovieDetails,
  fetchTmdbSeriesDetails,
  searchTmdbMovies,
  searchTmdbSeries,
} from "@/services/external/tmdb";

const freshMovie = {
  ...demoMovies[0],
  sourceUpdatedAt: new Date(),
};

const staleMovie = {
  ...demoMovies[0],
  sourceUpdatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
};

const freshSeries = {
  id: "series-1",
  tmdbId: 100,
  name: "The Last of Us",
  overview: "Overview",
  genres: ["Drama"],
  episodeRuntimeMinutes: 58,
  posterUrl: null,
  backdropUrl: null,
  firstAirDate: "2023-01-15",
  voteAverage: 8.7,
  numberOfSeasons: 2,
  numberOfEpisodes: 16,
  sourceUpdatedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("catalog enrichment", () => {
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  const mockedQueryMovies = vi.mocked(queryMovies);
  const mockedUpsertMovies = vi.mocked(upsertMovies);
  const mockedGetMovieById = vi.mocked(getMovieById);
  const mockedQuerySeries = vi.mocked(querySeries);
  const mockedUpsertSeries = vi.mocked(upsertSeries);
  const mockedGetSeriesById = vi.mocked(getSeriesById);
  const mockedSearchTmdbMovies = vi.mocked(searchTmdbMovies);
  const mockedSearchTmdbSeries = vi.mocked(searchTmdbSeries);
  const mockedFetchTmdbMovieDetails = vi.mocked(fetchTmdbMovieDetails);
  const mockedFetchTmdbSeriesDetails = vi.mocked(fetchTmdbSeriesDetails);

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it("skips movie TMDb search when the DB already has enough results", async () => {
    mockedQueryMovies.mockResolvedValue(Array.from({ length: 12 }, () => freshMovie));

    const result = await ensureMovieSearchResults("dune");

    expect(result).toBe(0);
    expect(mockedSearchTmdbMovies).not.toHaveBeenCalled();
  });

  it("imports missing movie search results and dedupes persisted entries", async () => {
    mockedQueryMovies.mockResolvedValue([freshMovie]);
    mockedSearchTmdbMovies.mockResolvedValue([freshMovie, { ...demoMovies[1] }]);
    mockedUpsertMovies.mockResolvedValue(1);

    const result = await ensureMovieSearchResults("science");

    expect(mockedSearchTmdbMovies).toHaveBeenCalledWith("science");
    expect(mockedUpsertMovies).toHaveBeenCalledWith([
      {
        ...demoMovies[1],
      },
    ]);
    expect(result).toBe(1);
  });

  it("returns local movie data unchanged when TMDb search fails", async () => {
    mockedQueryMovies.mockResolvedValue([]);
    mockedSearchTmdbMovies.mockRejectedValue(new Error("boom"));

    await expect(ensureMovieSearchResults("broken")).resolves.toBe(0);
    expect(mockedUpsertMovies).not.toHaveBeenCalled();
  });

  it("refreshes stale movie details from TMDb and re-reads the DB row", async () => {
    mockedGetMovieById.mockResolvedValueOnce(staleMovie).mockResolvedValueOnce({ ...staleMovie, runtimeMinutes: 170 });
    mockedFetchTmdbMovieDetails.mockResolvedValue({ ...demoMovies[0], runtimeMinutes: 170 });
    mockedUpsertMovies.mockResolvedValue(1);

    const result = await ensureMovieDetailsFresh(staleMovie.id);

    expect(mockedFetchTmdbMovieDetails).toHaveBeenCalledWith(staleMovie.tmdbId);
    expect(mockedUpsertMovies).toHaveBeenCalledWith([
      {
        id: staleMovie.id,
        ...demoMovies[0],
        runtimeMinutes: 170,
      },
    ]);
    expect(result?.runtimeMinutes).toBe(170);
  });

  it("imports missing series search results", async () => {
    mockedQuerySeries.mockResolvedValue([]);
    mockedSearchTmdbSeries.mockResolvedValue([freshSeries]);
    mockedUpsertSeries.mockResolvedValue(1);

    const result = await ensureSeriesSearchResults("last of us");

    expect(mockedSearchTmdbSeries).toHaveBeenCalledWith("last of us");
    expect(mockedUpsertSeries).toHaveBeenCalledWith([freshSeries]);
    expect(result).toBe(1);
  });

  it("refreshes stale series details from TMDb and re-reads the DB row", async () => {
    const staleSeries = {
      ...freshSeries,
      sourceUpdatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
      episodeRuntimeMinutes: null,
    };

    mockedGetSeriesById.mockResolvedValueOnce(staleSeries).mockResolvedValueOnce(freshSeries);
    mockedFetchTmdbSeriesDetails.mockResolvedValue(freshSeries);
    mockedUpsertSeries.mockResolvedValue(1);

    const result = await ensureSeriesDetailsFresh(staleSeries.id);

    expect(mockedFetchTmdbSeriesDetails).toHaveBeenCalledWith(staleSeries.tmdbId);
    expect(mockedUpsertSeries).toHaveBeenCalledWith([
      {
        id: staleSeries.id,
        ...freshSeries,
      },
    ]);
    expect(result?.episodeRuntimeMinutes).toBe(58);
  });
});
