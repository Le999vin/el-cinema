import type { Cinema } from "@/domain/types";
import { hasDatabase, hasGooglePlaces } from "@/lib/env";
import { getCinemaById, upsertCinemas } from "@/services/db/repositories/cinema-repository";
import { fetchGoogleCinemaDetails } from "@/services/external/google-places";

const CINEMA_DETAIL_STALE_MS = 1000 * 60 * 60 * 24 * 30;

const isOlderThanThreshold = (value: Date | null | undefined) =>
  !value || Date.now() - value.getTime() > CINEMA_DETAIL_STALE_MS;

const shouldRefreshCinemaDetails = (cinema: Cinema) =>
  !cinema.detailsSourceUpdatedAt || isOlderThanThreshold(cinema.detailsSourceUpdatedAt);

export const ensureCinemaDetailsFresh = async (cinemaId: string) => {
  const current = await getCinemaById(cinemaId);
  if (!current || !hasDatabase || !hasGooglePlaces || !shouldRefreshCinemaDetails(current)) {
    return current;
  }

  try {
    const details = await fetchGoogleCinemaDetails(current.googlePlaceId, {
      fallbackCity: current.city,
      fallbackRegion: current.region,
    });

    if (!details) {
      return current;
    }

    await upsertCinemas([{ id: current.id, ...details }]);
    return await getCinemaById(cinemaId);
  } catch (error) {
    console.error("Cinema Google Places detail refresh failed.", error);
    return current;
  }
};
