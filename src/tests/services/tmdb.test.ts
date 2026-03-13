import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: { TMDB_API_KEY: "test-key" },
  hasTmdb: true,
}));

import { discoverTmdbNowShowing, discoverTmdbUpcoming } from "@/services/external/tmdb";

const buildPayload = (page: number) => ({
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
      return new Response(JSON.stringify(buildPayload(page)), { status: 200 });
    });

    const result = await discoverTmdbNowShowing();

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result.map((movie) => movie.title)).toEqual(["Movie 1", "Movie 2", "Movie 3"]);
  });

  it("loads multiple upcoming pages", async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = new URL(input.toString());
      const page = Number(url.searchParams.get("page"));
      return new Response(JSON.stringify(buildPayload(page)), { status: 200 });
    });

    const result = await discoverTmdbUpcoming();

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result.map((movie) => movie.tmdbId)).toEqual([1001, 1002, 1003]);
  });
});
