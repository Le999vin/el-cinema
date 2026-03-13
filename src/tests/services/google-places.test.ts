import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: {
    GOOGLE_PLACES_API_KEY: "test-google-key",
  },
  hasGooglePlaces: true,
}));

vi.mock("@/lib/swiss-discovery-areas", () => ({
  SWISS_DISCOVERY_AREAS: [
    {
      label: "Zurich",
      fallbackCity: "Zurich",
      fallbackRegion: "ZH",
      latitude: 47.3769,
      longitude: 8.5417,
      radiusMeters: 30_000,
    },
    {
      label: "Bern",
      fallbackCity: "Bern",
      fallbackRegion: "BE",
      latitude: 46.948,
      longitude: 7.4474,
      radiusMeters: 26_000,
    },
  ],
  SWISS_REGION_CODES: ["BE", "ZH"],
  SWITZERLAND_CENTER: [46.8182, 8.2275],
  SWITZERLAND_DEFAULT_ZOOM: 8,
}));

import { fetchGoogleCinemaDetails, fetchSwissCinemasFromGoogle } from "@/services/external/google-places";

const buildAddressComponents = (city: string, region: string) => [
  { longText: city, shortText: city, types: ["locality"] },
  { longText: region, shortText: region, types: ["administrative_area_level_1"] },
];

describe("google places cinema service", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("dedupes overlapping Swiss discovery results by Google Place ID", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            places: [
              {
                id: "google-place-1",
                displayName: { text: "Cinema One" },
                formattedAddress: "Langstrasse 1, 8004 Zurich, Switzerland",
                location: { latitude: 47.378, longitude: 8.529 },
                addressComponents: buildAddressComponents("Zurich", "ZH"),
                googleMapsUri: "https://maps.google.com/?cid=1",
                types: ["movie_theater"],
              },
            ],
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            places: [
              {
                id: "google-place-1",
                displayName: { text: "Cinema One" },
                formattedAddress: "Langstrasse 1, 8004 Zurich, Switzerland",
                location: { latitude: 47.378, longitude: 8.529 },
                addressComponents: buildAddressComponents("Zurich", "ZH"),
                googleMapsUri: "https://maps.google.com/?cid=1",
                types: ["movie_theater"],
              },
              {
                id: "google-place-2",
                displayName: { text: "Cinema Two" },
                formattedAddress: "Marktgasse 10, 3011 Bern, Switzerland",
                location: { latitude: 46.9488, longitude: 7.4476 },
                addressComponents: buildAddressComponents("Bern", "BE"),
                googleMapsUri: "https://maps.google.com/?cid=2",
                types: ["movie_theater"],
              },
            ],
          }),
        ),
      );

    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchSwissCinemasFromGoogle();

    expect(result.discovered).toBe(3);
    expect(result.deduped).toBe(2);
    expect(result.payload.map((cinema) => cinema.googlePlaceId)).toEqual(["google-place-1", "google-place-2"]);
    expect(result.failures).toEqual([]);

    const [firstCall] = fetchMock.mock.calls;
    const [, requestInit] = firstCall as [string, RequestInit & { headers: Record<string, string> }];

    expect(requestInit.headers["X-Goog-FieldMask"]).toContain("places.id");
    expect(JSON.parse(String(requestInit.body))).toMatchObject({
      includedType: "movie_theater",
      strictTypeFiltering: true,
      regionCode: "CH",
    });
  });

  it("normalizes cinema detail enrichment payloads", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "google-place-1",
          displayName: { text: "Cinema One" },
          formattedAddress: "Langstrasse 1, 8004 Zurich, Switzerland",
          location: { latitude: 47.378, longitude: 8.529 },
          addressComponents: buildAddressComponents("Zurich", "ZH"),
          googleMapsUri: "https://maps.google.com/?cid=1",
          rating: 4.3,
          websiteUri: "https://cinema-one.example",
          nationalPhoneNumber: "+41 44 123 45 67",
          regularOpeningHours: {
            weekdayDescriptions: ["Monday: 10:00 AM – 10:00 PM"],
          },
          editorialSummary: {
            text: "Independent screenings and late-night programs.",
          },
          types: ["movie_theater"],
        }),
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchGoogleCinemaDetails("google-place-1", {
      fallbackCity: "Zurich",
      fallbackRegion: "ZH",
    });

    expect(result).toMatchObject({
      googlePlaceId: "google-place-1",
      name: "Cinema One",
      city: "Zurich",
      region: "ZH",
      rating: 4.3,
      websiteUrl: "https://cinema-one.example",
      phoneNumber: "+41 44 123 45 67",
      googleMapsUri: "https://maps.google.com/?cid=1",
      openingHours: ["Monday: 10:00 AM – 10:00 PM"],
      editorialSummary: "Independent screenings and late-night programs.",
      types: ["movie_theater"],
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
