import { z } from "zod";

import type { CinemaUpsertInput } from "@/services/db/repositories/cinema-repository";
import { SWISS_REGION_CODES, type SwissDiscoveryArea } from "@/lib/swiss-discovery-areas";

const googleAddressComponentSchema = z.object({
  longText: z.string(),
  shortText: z.string().optional(),
  types: z.array(z.string()).default([]),
});

const googlePlaceSchema = z.object({
  id: z.string(),
  displayName: z.object({ text: z.string() }).optional(),
  formattedAddress: z.string().optional(),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  addressComponents: z.array(googleAddressComponentSchema).default([]),
  googleMapsUri: z.string().optional(),
  rating: z.number().nullable().optional(),
  websiteUri: z.string().optional(),
  nationalPhoneNumber: z.string().optional(),
  regularOpeningHours: z
    .object({
      weekdayDescriptions: z.array(z.string()).default([]),
    })
    .optional(),
  editorialSummary: z
    .object({
      text: z.string(),
    })
    .optional(),
  types: z.array(z.string()).default([]),
});

const googlePlacesSearchResponseSchema = z.object({
  places: z.array(googlePlaceSchema).default([]),
  nextPageToken: z.string().optional(),
});

const googlePlaceDetailsResponseSchema = googlePlaceSchema;

const getComponent = (
  components: readonly z.infer<typeof googleAddressComponentSchema>[],
  type: string,
) => components.find((component) => component.types.includes(type));

const getDistrict = (components: readonly z.infer<typeof googleAddressComponentSchema>[]) =>
  getComponent(components, "sublocality_level_1") ??
  getComponent(components, "sublocality") ??
  getComponent(components, "neighborhood");

const getCity = (components: readonly z.infer<typeof googleAddressComponentSchema>[]) =>
  getComponent(components, "locality") ??
  getComponent(components, "postal_town") ??
  getComponent(components, "administrative_area_level_3");

const getRegion = (components: readonly z.infer<typeof googleAddressComponentSchema>[]) =>
  getComponent(components, "administrative_area_level_1");

const getCountry = (components: readonly z.infer<typeof googleAddressComponentSchema>[]) =>
  getComponent(components, "country");

const normalizePlace = (
  place: z.infer<typeof googlePlaceSchema>,
  area: Pick<SwissDiscoveryArea, "fallbackCity" | "fallbackRegion">,
): Omit<CinemaUpsertInput, "sourceUpdatedAt" | "detailsSourceUpdatedAt"> => ({
  googlePlaceId: place.id,
  name: place.displayName?.text ?? "Cinema",
  address: place.formattedAddress ?? area.fallbackCity,
  city: getCity(place.addressComponents)?.longText ?? area.fallbackCity,
  region: getRegion(place.addressComponents)?.shortText ?? area.fallbackRegion,
  district: getDistrict(place.addressComponents)?.longText ?? null,
  lat: place.location?.latitude ?? 0,
  lng: place.location?.longitude ?? 0,
  websiteUrl: place.websiteUri ?? null,
  phoneNumber: place.nationalPhoneNumber ?? null,
  chain: null,
  rating: place.rating ?? null,
  googleMapsUri: place.googleMapsUri ?? null,
  openingHours: place.regularOpeningHours?.weekdayDescriptions ?? [],
  editorialSummary: place.editorialSummary?.text ?? null,
  types: place.types ?? [],
});

export const normalizeDiscoveredGooglePlaceCinema = (
  place: z.infer<typeof googlePlaceSchema>,
  area: Pick<SwissDiscoveryArea, "fallbackCity" | "fallbackRegion">,
): CinemaUpsertInput => ({
  ...normalizePlace(place, area),
  sourceUpdatedAt: new Date(),
});

export const normalizeGooglePlaceCinemaDetails = (
  place: z.infer<typeof googlePlaceSchema>,
  area: Pick<SwissDiscoveryArea, "fallbackCity" | "fallbackRegion">,
): CinemaUpsertInput => ({
  ...normalizePlace(place, area),
  sourceUpdatedAt: new Date(),
  detailsSourceUpdatedAt: new Date(),
});

export const parseGooglePlacesSearchResponse = (payload: unknown) => googlePlacesSearchResponseSchema.parse(payload);

export const parseGooglePlaceDetails = (payload: unknown) => googlePlaceDetailsResponseSchema.parse(payload);

export const isSwissGooglePlace = (place: z.infer<typeof googlePlaceSchema>) => {
  const country = getCountry(place.addressComponents);
  if (country?.shortText) {
    return country.shortText === "CH";
  }

  if (country?.longText) {
    return country.longText.toLowerCase() === "switzerland";
  }

  const region = getRegion(place.addressComponents)?.shortText;
  if (region) {
    return SWISS_REGION_CODES.includes(region);
  }

  return true;
};
