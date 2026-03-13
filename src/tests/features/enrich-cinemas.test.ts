import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  hasDatabase: true,
  hasGooglePlaces: true,
}));

vi.mock("@/services/db/repositories/cinema-repository", () => ({
  getCinemaById: vi.fn(),
  queryCinemas: vi.fn(),
  upsertCinemas: vi.fn(),
}));

vi.mock("@/services/external/google-places", () => ({
  fetchGoogleCinemaDetails: vi.fn(),
  searchSwissCinemasByQuery: vi.fn(),
}));

import { ensureCinemaDetailsFresh, ensureCinemaSearchResults } from "@/features/cinemas/enrich-cinemas";
import { getCinemaById, queryCinemas, upsertCinemas } from "@/services/db/repositories/cinema-repository";
import { fetchGoogleCinemaDetails, searchSwissCinemasByQuery } from "@/services/external/google-places";

const staleCinema = {
  id: "cinema-1",
  googlePlaceId: "google-place-1",
  name: "Cinema One",
  address: "Langstrasse 1, 8004 Zurich",
  city: "Zurich",
  region: "ZH",
  district: "Langstrasse",
  lat: 47.378,
  lng: 8.529,
  websiteUrl: null,
  phoneNumber: null,
  chain: null,
  rating: null,
  googleMapsUri: null,
  openingHours: [],
  editorialSummary: null,
  types: ["movie_theater"],
  sourceUpdatedAt: new Date(),
  detailsSourceUpdatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 31),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("cinema enrichment", () => {
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  const mockedGetCinemaById = vi.mocked(getCinemaById);
  const mockedQueryCinemas = vi.mocked(queryCinemas);
  const mockedUpsertCinemas = vi.mocked(upsertCinemas);
  const mockedFetchGoogleCinemaDetails = vi.mocked(fetchGoogleCinemaDetails);
  const mockedSearchSwissCinemasByQuery = vi.mocked(searchSwissCinemasByQuery);

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it("refreshes stale cinema details from Google Places and re-reads the DB row", async () => {
    mockedGetCinemaById
      .mockResolvedValueOnce(staleCinema)
      .mockResolvedValueOnce({
        ...staleCinema,
        websiteUrl: "https://cinema-one.example",
        detailsSourceUpdatedAt: new Date(),
      });
    mockedFetchGoogleCinemaDetails.mockResolvedValue({
      googlePlaceId: "google-place-1",
      name: "Cinema One",
      address: "Langstrasse 1, 8004 Zurich",
      city: "Zurich",
      region: "ZH",
      district: "Langstrasse",
      lat: 47.378,
      lng: 8.529,
      websiteUrl: "https://cinema-one.example",
      phoneNumber: "+41 44 123 45 67",
      chain: null,
      rating: 4.3,
      googleMapsUri: "https://maps.google.com/?cid=1",
      openingHours: ["Monday: 10:00 AM – 10:00 PM"],
      editorialSummary: "Independent screenings.",
      types: ["movie_theater"],
      sourceUpdatedAt: new Date(),
      detailsSourceUpdatedAt: new Date(),
    });
    mockedUpsertCinemas.mockResolvedValue(1);

    const result = await ensureCinemaDetailsFresh("cinema-1");

    expect(mockedFetchGoogleCinemaDetails).toHaveBeenCalledWith("google-place-1", {
      fallbackCity: "Zurich",
      fallbackRegion: "ZH",
    });
    expect(mockedUpsertCinemas).toHaveBeenCalledWith([
      expect.objectContaining({
        id: "cinema-1",
        googlePlaceId: "google-place-1",
        websiteUrl: "https://cinema-one.example",
      }),
    ]);
    expect(result?.websiteUrl).toBe("https://cinema-one.example");
  });

  it("skips search enrichment when the DB already has a local cinema match", async () => {
    mockedQueryCinemas.mockResolvedValue([staleCinema]);

    const result = await ensureCinemaSearchResults("wädenswil");

    expect(result).toBe(0);
    expect(mockedSearchSwissCinemasByQuery).not.toHaveBeenCalled();
    expect(mockedUpsertCinemas).not.toHaveBeenCalled();
  });

  it("imports missing cinema search results from Google Places", async () => {
    mockedQueryCinemas.mockResolvedValue([]);
    mockedSearchSwissCinemasByQuery.mockResolvedValue([
      {
        googlePlaceId: "google-place-2",
        name: "Schloss Cinéma",
        address: "Schönenbergstrasse 1, 8820 Wädenswil",
        city: "Wädenswil",
        region: "ZH",
        district: null,
        lat: 47.229,
        lng: 8.668,
        websiteUrl: null,
        phoneNumber: null,
        chain: null,
        rating: 4.4,
        googleMapsUri: "https://maps.google.com/?cid=2",
        openingHours: [],
        editorialSummary: null,
        types: ["movie_theater"],
        sourceUpdatedAt: new Date(),
      },
    ]);
    mockedUpsertCinemas.mockResolvedValue(1);

    const result = await ensureCinemaSearchResults("wädenswil");

    expect(mockedSearchSwissCinemasByQuery).toHaveBeenCalledWith("wädenswil");
    expect(mockedUpsertCinemas).toHaveBeenCalledWith([
      expect.objectContaining({
        googlePlaceId: "google-place-2",
        city: "Wädenswil",
      }),
    ]);
    expect(result).toBe(1);
  });

  it("returns an empty DB-backed result when Google Places search enrichment fails", async () => {
    mockedQueryCinemas.mockResolvedValue([]);
    mockedSearchSwissCinemasByQuery.mockRejectedValue(new Error("boom"));

    await expect(ensureCinemaSearchResults("wädenswil")).resolves.toBe(0);
    expect(mockedUpsertCinemas).not.toHaveBeenCalled();
  });

  it("skips Google Places when cinema details are still fresh", async () => {
    mockedGetCinemaById.mockResolvedValue({
      ...staleCinema,
      websiteUrl: "https://cinema-one.example",
      detailsSourceUpdatedAt: new Date(),
    });

    const result = await ensureCinemaDetailsFresh("cinema-1");

    expect(mockedFetchGoogleCinemaDetails).not.toHaveBeenCalled();
    expect(mockedUpsertCinemas).not.toHaveBeenCalled();
    expect(result?.websiteUrl).toBe("https://cinema-one.example");
  });
});
