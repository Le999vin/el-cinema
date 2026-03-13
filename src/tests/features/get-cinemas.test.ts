import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

import type { Cinema } from "@/domain/types";

vi.mock("@/lib/env", () => ({
  hasDatabase: true,
}));

vi.mock("@/services/db/repositories/cinema-repository", () => ({
  listCinemaActivity: vi.fn(),
  queryCinemas: vi.fn(),
}));

vi.mock("@/features/catalog/load-catalog", () => ({
  loadCinemasCatalog: vi.fn(),
  loadMoviesCatalog: vi.fn(),
  loadShowtimesCatalog: vi.fn(),
}));

vi.mock("@/features/cinemas/enrich-cinemas", () => ({
  ensureCinemaDetailsFresh: vi.fn(),
}));

import { getCinemasPageData } from "@/features/cinemas/get-cinemas";
import { loadCinemasCatalog, loadShowtimesCatalog } from "@/features/catalog/load-catalog";
import { listCinemaActivity, queryCinemas } from "@/services/db/repositories/cinema-repository";

const baseCinema = (overrides: Partial<Cinema>): Cinema => ({
  id: "cinema-1",
  googlePlaceId: "google-place-1",
  name: "Cinema One",
  address: "Langstrasse 1, 8004 Zurich",
  city: "Zurich",
  region: "ZH",
  district: "Langstrasse",
  lat: 47.378,
  lng: 8.529,
  websiteUrl: "https://cinema-one.example",
  phoneNumber: null,
  chain: null,
  rating: null,
  googleMapsUri: null,
  openingHours: [],
  editorialSummary: null,
  types: ["movie_theater"],
  sourceUpdatedAt: new Date(),
  detailsSourceUpdatedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("getCinemasPageData", () => {
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  const mockedQueryCinemas = vi.mocked(queryCinemas);
  const mockedListCinemaActivity = vi.mocked(listCinemaActivity);
  const mockedLoadCinemasCatalog = vi.mocked(loadCinemasCatalog);
  const mockedLoadShowtimesCatalog = vi.mocked(loadShowtimesCatalog);

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it("sorts cinemas by showtime activity and keeps map data in sync with the filtered DB result", async () => {
    const cinemas = [
      baseCinema({ id: "cinema-1", name: "Frame Zurich" }),
      baseCinema({ id: "cinema-2", googlePlaceId: "google-place-2", name: "Cinema Rex Bern", city: "Bern", region: "BE" }),
    ];

    mockedQueryCinemas.mockResolvedValue(cinemas);
    mockedListCinemaActivity.mockResolvedValue([
      { cinemaId: "cinema-1", showtimeCount: 3, movieCount: 2 },
      { cinemaId: "cinema-2", showtimeCount: 7, movieCount: 4 },
    ]);

    const result = await getCinemasPageData({ search: "cinema", sort: "showtimes" });

    expect(mockedQueryCinemas).toHaveBeenCalledWith({ search: "cinema", city: undefined });
    expect(result.summaries.map((cinema) => cinema.id)).toEqual(["cinema-2", "cinema-1"]);
    expect(result.mapCinemas.map((cinema) => cinema.id)).toEqual(["cinema-2", "cinema-1"]);
    expect(result.summaries[0]).toMatchObject({
      region: "BE",
      types: ["movie_theater"],
      showtimeCount: 7,
      movieCount: 4,
    });
  });

  it("returns an empty filtered DB result instead of falling back to demo cinemas when the DB catalog exists", async () => {
    mockedQueryCinemas.mockResolvedValueOnce([]).mockResolvedValueOnce([baseCinema({ id: "cinema-1" })]);

    const result = await getCinemasPageData({ search: "nonexistent", sort: "name" });

    expect(result).toEqual({ summaries: [], mapCinemas: [] });
    expect(mockedLoadCinemasCatalog).not.toHaveBeenCalled();
  });

  it("falls back to the local catalog when the DB query fails", async () => {
    const fallbackCinema = baseCinema({ id: "fallback-cinema", name: "Riffraff" });

    mockedQueryCinemas.mockRejectedValue(new Error("db down"));
    mockedLoadCinemasCatalog.mockResolvedValue([fallbackCinema]);
    mockedLoadShowtimesCatalog.mockResolvedValue([
      {
        id: "showtime-1",
        cinemaId: "fallback-cinema",
        movieId: "movie-1",
        startsAt: new Date(),
        language: "EN",
        subtitleLanguage: null,
        room: "Room 1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await getCinemasPageData({ search: "riffraff", sort: "showtimes" });

    expect(result.summaries.map((cinema) => cinema.name)).toEqual(["Riffraff"]);
    expect(result.mapCinemas.map((cinema) => cinema.name)).toEqual(["Riffraff"]);
  });
});
