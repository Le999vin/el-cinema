import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: { TMDB_API_KEY: "test-key" },
  hasTmdb: true,
}));

import {
  discoverTmdbMoviesByCollection,
  discoverTmdbNowShowing,
  discoverTmdbSeriesByCollection,
  discoverTmdbUpcoming,
  searchTmdbSeries,
} from "@/services/external/tmdb";

const buildMoviePayload = (page: number) => ({
  results: [
    {
      id: 1000 + page,
      title: `Movie ${page}`,
      overview: `Overview ${page}`,
      genre_ids: [18],
      runtime: 120 + page,
      poster_path: `/poster-${page}.jpg`,
      backdrop_path: `/backdrop-${page}.jpg`,
      release_date: `2026-01-0${page}`,
      vote_average: 7.5,
    },
  ],
});

const buildSeriesPayload = (page: number) => ({
  results: [
    {
      id: 2000 + page,
      name: `Series ${page}`,
      overview: `Series Overview ${page}`,
      genre_ids: [18, 10765],
      episode_run_time: [50 + page],
      poster_path: `/series-poster-${page}.jpg`,
      backdrop_path: `/series-backdrop-${page}.jpg`,
      first_air_date: `2026-02-0${page}`,
      vote_average: 8.1,
      number_of_seasons: 2,
      number_of_episodes: 16,
    },
  ],
});

describe("tmdb discovery", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("loads multiple now-playing pages", async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = new URL(input.toString());
      const page = Number(url.searchParams.get("page"));
      return new Response(JSON.stringify(buildMoviePayload(page)), { status: 200 });
    });

    const result = await discoverTmdbNowShowing();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.map((movie) => movie.title)).toEqual(["Movie 1", "Movie 2"]);
  });

  it("loads multiple upcoming pages", async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = new URL(input.toString());
      const page = Number(url.searchParams.get("page"));
      return new Response(JSON.stringify(buildMoviePayload(page)), { status: 200 });
    });

    const result = await discoverTmdbUpcoming();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.map((movie) => movie.tmdbId)).toEqual([1001, 1002]);
  });

  it("supports broader movie bootstrap collections", async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = new URL(input.toString());
      const page = Number(url.searchParams.get("page"));
      return new Response(JSON.stringify(buildMoviePayload(page)), { status: 200 });
    });

    const result = await discoverTmdbMoviesByCollection("popular");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result[0].title).toBe("Movie 1");
  });

  it("supports series discovery collections", async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = new URL(input.toString());
      const page = Number(url.searchParams.get("page"));
      return new Response(JSON.stringify(buildSeriesPayload(page)), { status: 200 });
    });

    const result = await discoverTmdbSeriesByCollection("popular");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.map((entry) => entry.name)).toEqual(["Series 1", "Series 2"]);
    expect(result[0].episodeRuntimeMinutes).toBe(51);
  });

  it("supports series search results", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(buildSeriesPayload(1)), { status: 200 }));

    const result = await searchTmdbSeries("last of us");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result[0]).toMatchObject({
      tmdbId: 2001,
      name: "Series 1",
      numberOfSeasons: 2,
      numberOfEpisodes: 16,
    });
  });
});
