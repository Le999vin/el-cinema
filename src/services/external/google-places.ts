import { hasGooglePlaces, env } from "@/lib/env";
import {
  normalizeGooglePlaceCinema,
  parsePlaceDetails,
  parsePlacesTextSearch,
} from "@/services/external/normalizers-google";

const PLACES_TEXT_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json";
const PLACES_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

const fetchJson = async (url: string): Promise<unknown> => {
  const response = await fetch(url, {
    next: { revalidate: 60 * 60 * 6 },
  });

  if (!response.ok) {
    throw new Error(`Google Places request failed (${response.status}).`);
  }

  return response.json();
};

export const fetchZurichCinemasFromGoogle = async () => {
  if (!hasGooglePlaces || !env.GOOGLE_PLACES_API_KEY) {
    return [];
  }

  const url = `${PLACES_TEXT_SEARCH_URL}?query=${encodeURIComponent("cinema in zurich")}&key=${env.GOOGLE_PLACES_API_KEY}`;
  const payload = await fetchJson(url);
  const parsed = parsePlacesTextSearch(payload);

  const cinemas = await Promise.all(
    parsed.results.slice(0, 20).map(async (result) => {
      const detailsUrl = `${PLACES_DETAILS_URL}?place_id=${result.place_id}&fields=place_id,name,formatted_address,website,formatted_phone_number,address_component&key=${env.GOOGLE_PLACES_API_KEY}`;

      try {
        const detailsPayload = await fetchJson(detailsUrl);
        const detailsParsed = parsePlaceDetails(detailsPayload);
        return normalizeGooglePlaceCinema(result, detailsParsed.result);
      } catch {
        return normalizeGooglePlaceCinema(result);
      }
    }),
  );

  return cinemas;
};
