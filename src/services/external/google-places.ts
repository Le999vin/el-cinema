import { env, hasGooglePlaces } from "@/lib/env";
import { SWISS_DISCOVERY_AREAS, type SwissDiscoveryArea } from "@/lib/swiss-discovery-areas";
import {
  isSwissGooglePlace,
  normalizeDiscoveredGooglePlaceCinema,
  normalizeGooglePlaceCinemaDetails,
  parseGooglePlaceDetails,
  parseGooglePlacesSearchResponse,
} from "@/services/external/normalizers-google";

const BASE_URL = "https://places.googleapis.com/v1";

const DISCOVERY_PAGE_SIZE = 20;
const DISCOVERY_MAX_PAGES = 2;
const DISCOVERY_REVALIDATE_SECONDS = 60 * 60 * 6;
const SEARCH_PAGE_SIZE = 5;
const SEARCH_REVALIDATE_SECONDS = 60 * 60;
const DETAIL_REVALIDATE_SECONDS = 60 * 60 * 24;
const CH_REGION_CODE = "CH";

const DISCOVERY_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.addressComponents",
  "places.googleMapsUri",
  "places.rating",
  "places.types",
  "nextPageToken",
].join(",");

const DETAIL_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "addressComponents",
  "googleMapsUri",
  "rating",
  "types",
  "websiteUri",
  "nationalPhoneNumber",
  "regularOpeningHours.weekdayDescriptions",
  "editorialSummary.text",
].join(",");

export interface SwissCinemaDiscoveryAreaStats {
  label: string;
  pagesFetched: number;
  discovered: number;
}

export interface SwissCinemaDiscoveryResult {
  payload: ReturnType<typeof normalizeDiscoveredGooglePlaceCinema>[];
  searchedAreas: SwissCinemaDiscoveryAreaStats[];
  discovered: number;
  deduped: number;
  failures: Array<{ area: string; message: string }>;
}

const toRadians = (value: number) => (value * Math.PI) / 180;

const buildAreaRectangle = (area: SwissDiscoveryArea) => {
  const latitudeDelta = area.radiusMeters / 111_320;
  const longitudeDelta = area.radiusMeters / (111_320 * Math.max(Math.cos(toRadians(area.latitude)), 0.2));

  return {
    low: {
      latitude: area.latitude - latitudeDelta,
      longitude: area.longitude - longitudeDelta,
    },
    high: {
      latitude: area.latitude + latitudeDelta,
      longitude: area.longitude + longitudeDelta,
    },
  };
};

const getErrorMessage = async (response: Response) => {
  try {
    const payload = (await response.json()) as { error?: { message?: string; status?: string } };
    return payload.error?.message ?? payload.error?.status ?? response.statusText;
  } catch {
    return response.statusText;
  }
};

const fetchGooglePlaces = async (
  path: string,
  init: RequestInit & { fieldMask: string; revalidate: number },
): Promise<unknown> => {
  if (!env.GOOGLE_PLACES_API_KEY) {
    throw new Error("GOOGLE_PLACES_API_KEY is not configured.");
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": env.GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": init.fieldMask,
      ...(init.headers ?? {}),
    },
    next: { revalidate: init.revalidate },
  });

  if (!response.ok) {
    throw new Error(`Google Places request failed (${response.status}): ${await getErrorMessage(response)}`);
  }

  return response.json();
};

const searchSwissCinemaArea = async (area: SwissDiscoveryArea) => {
  const results: ReturnType<typeof normalizeDiscoveredGooglePlaceCinema>[] = [];
  let nextPageToken: string | undefined;
  let pagesFetched = 0;

  for (let page = 0; page < DISCOVERY_MAX_PAGES; page += 1) {
    const payload = await fetchGooglePlaces("/places:searchText", {
      method: "POST",
      body: JSON.stringify({
        textQuery: `movie theater in ${area.label}, Switzerland`,
        languageCode: "en",
        regionCode: CH_REGION_CODE,
        pageSize: DISCOVERY_PAGE_SIZE,
        includedType: "movie_theater",
        strictTypeFiltering: true,
        locationRestriction: {
          rectangle: buildAreaRectangle(area),
        },
        pageToken: nextPageToken,
      }),
      fieldMask: DISCOVERY_FIELD_MASK,
      revalidate: DISCOVERY_REVALIDATE_SECONDS,
    });

    const parsed = parseGooglePlacesSearchResponse(payload);
    pagesFetched += 1;

    results.push(
      ...parsed.places
        .filter(
          (place) =>
            isSwissGooglePlace(place) && place.location?.latitude != null && place.location?.longitude != null,
        )
        .map((place) => normalizeDiscoveredGooglePlaceCinema(place, area)),
    );

    if (!parsed.nextPageToken) {
      break;
    }

    nextPageToken = parsed.nextPageToken;
  }

  return {
    area: area.label,
    pagesFetched,
    payload: results,
  };
};

export const fetchSwissCinemasFromGoogle = async (): Promise<SwissCinemaDiscoveryResult> => {
  if (!hasGooglePlaces) {
    return {
      payload: [],
      searchedAreas: [],
      discovered: 0,
      deduped: 0,
      failures: [{ area: "switzerland", message: "GOOGLE_PLACES_API_KEY missing" }],
    };
  }

  const deduped = new Map<string, ReturnType<typeof normalizeDiscoveredGooglePlaceCinema>>();
  const searchedAreas: SwissCinemaDiscoveryAreaStats[] = [];
  const failures: Array<{ area: string; message: string }> = [];
  let discovered = 0;

  for (const area of SWISS_DISCOVERY_AREAS) {
    try {
      const result = await searchSwissCinemaArea(area);
      discovered += result.payload.length;
      searchedAreas.push({
        label: area.label,
        pagesFetched: result.pagesFetched,
        discovered: result.payload.length,
      });

      for (const cinema of result.payload) {
        deduped.set(cinema.googlePlaceId, cinema);
      }
    } catch (error) {
      failures.push({
        area: area.label,
        message: error instanceof Error ? error.message : "Unknown Google Places error",
      });
    }
  }

  return {
    payload: [...deduped.values()],
    searchedAreas,
    discovered,
    deduped: deduped.size,
    failures,
  };
};

export const searchSwissCinemasByQuery = async (query: string) => {
  const trimmed = query.trim();
  if (!hasGooglePlaces || !trimmed) {
    return [];
  }

  const payload = await fetchGooglePlaces("/places:searchText", {
    method: "POST",
    body: JSON.stringify({
      textQuery: `${trimmed} movie theater Switzerland`,
      languageCode: "en",
      regionCode: CH_REGION_CODE,
      pageSize: SEARCH_PAGE_SIZE,
      includedType: "movie_theater",
      strictTypeFiltering: true,
    }),
    fieldMask: DISCOVERY_FIELD_MASK,
    revalidate: SEARCH_REVALIDATE_SECONDS,
  });

  const parsed = parseGooglePlacesSearchResponse(payload);
  const deduped = new Map<string, ReturnType<typeof normalizeDiscoveredGooglePlaceCinema>>();

  for (const place of parsed.places) {
    if (!isSwissGooglePlace(place) || place.location?.latitude == null || place.location?.longitude == null) {
      continue;
    }

    const normalized = normalizeDiscoveredGooglePlaceCinema(place, {
      fallbackCity: trimmed,
      fallbackRegion: CH_REGION_CODE,
    });

    deduped.set(normalized.googlePlaceId, normalized);
  }

  return [...deduped.values()];
};

export const fetchGoogleCinemaDetails = async (
  googlePlaceId: string,
  area: Pick<SwissDiscoveryArea, "fallbackCity" | "fallbackRegion">,
) => {
  if (!hasGooglePlaces) {
    return null;
  }

  const payload = await fetchGooglePlaces(`/places/${googlePlaceId}`, {
    method: "GET",
    fieldMask: DETAIL_FIELD_MASK,
    revalidate: DETAIL_REVALIDATE_SECONDS,
  });

  const parsed = parseGooglePlaceDetails(payload);
  if (!isSwissGooglePlace(parsed) || parsed.location?.latitude == null || parsed.location?.longitude == null) {
    return null;
  }

  return normalizeGooglePlaceCinemaDetails(parsed, area);
};
