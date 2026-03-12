import { z } from "zod";

import { ACTIVE_CITY, ACTIVE_REGION } from "@/lib/constants";

const placesTextSearchSchema = z.object({
  results: z.array(
    z.object({
      place_id: z.string(),
      name: z.string(),
      formatted_address: z.string(),
      geometry: z.object({
        location: z.object({
          lat: z.number(),
          lng: z.number(),
        }),
      }),
    }),
  ),
});

const placeDetailsSchema = z.object({
  result: z.object({
    place_id: z.string(),
    website: z.string().optional(),
    formatted_phone_number: z.string().optional(),
    name: z.string(),
    formatted_address: z.string(),
    address_components: z
      .array(
        z.object({
          long_name: z.string(),
          short_name: z.string(),
          types: z.array(z.string()),
        }),
      )
      .default([]),
  }),
});

export const normalizeGooglePlaceCinema = (
  result: z.infer<typeof placesTextSearchSchema>["results"][number],
  details?: z.infer<typeof placeDetailsSchema>["result"],
) => {
  const districtComponent = details?.address_components.find((component) =>
    component.types.includes("sublocality") || component.types.includes("sublocality_level_1"),
  );

  return {
    googlePlaceId: result.place_id,
    name: details?.name ?? result.name,
    address: details?.formatted_address ?? result.formatted_address,
    city: ACTIVE_CITY,
    region: ACTIVE_REGION,
    district: districtComponent?.long_name ?? null,
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    websiteUrl: details?.website ?? null,
    phoneNumber: details?.formatted_phone_number ?? null,
    chain: null,
  };
};

export const parsePlacesTextSearch = (payload: unknown) => placesTextSearchSchema.parse(payload);

export const parsePlaceDetails = (payload: unknown) => placeDetailsSchema.parse(payload);

