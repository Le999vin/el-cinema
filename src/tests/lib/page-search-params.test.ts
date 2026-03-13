import { describe, expect, it } from "vitest";

import {
  parseCinemasPageSearchParams,
  parseMoviesPageSearchParams,
  parseSeriesPageSearchParams,
  parseShowtimesPageSearchParams,
  resolvePageSearchParams,
} from "@/lib/page-search-params";

describe("page search params", () => {
  it("resolves promise-based search params and normalizes arrays", async () => {
    const params = await resolvePageSearchParams(
      Promise.resolve({
        search: ["dune", "ignored"],
        genre: undefined,
        sort: "release-date",
      }),
    );

    expect(params).toEqual({
      search: "dune",
      genre: "",
      sort: "release-date",
    });
  });

  it("applies movie defaults and rejects invalid sort values", async () => {
    const params = await parseMoviesPageSearchParams({
      search: undefined,
      genre: undefined,
      sort: "newest",
    });

    expect(params).toEqual({
      search: "",
      genre: "",
      sort: "release-date",
    });
  });

  it("applies cinema defaults", async () => {
    const params = await parseCinemasPageSearchParams(undefined);

    expect(params).toEqual({
      search: "",
      sort: "name",
    });
  });

  it("applies series defaults and rejects invalid sort values", async () => {
    const params = await parseSeriesPageSearchParams({
      search: undefined,
      genre: "Drama",
      sort: "newest",
    });

    expect(params).toEqual({
      search: "",
      genre: "Drama",
      sort: "release-date",
    });
  });

  it("applies showtime defaults and parses numeric filters", async () => {
    const params = await parseShowtimesPageSearchParams(
      Promise.resolve({
        mode: "later",
        movieId: ["movie-1"],
        cinemaId: "",
        timeStart: "18",
        timeEnd: "23",
      }),
    );

    expect(params).toEqual({
      mode: "today",
      movieId: "movie-1",
      cinemaId: "",
      timeStart: 18,
      timeEnd: 23,
    });
  });
});
