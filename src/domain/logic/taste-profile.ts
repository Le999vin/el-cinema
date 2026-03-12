import { aggregateRatings } from "@/domain/logic/ratings";
import type { TasteProfile, UserProfile } from "@/domain/types";

const EVENING_START_HOUR = 17;

export const deriveTasteProfile = (profile: UserProfile): TasteProfile => {
  const genreAffinity = profile.ratings.reduce<Record<string, number>>((acc, rating) => {
    const base = rating.overall;
    const movieGenres = profile.preferences.favouriteGenres;

    if (!movieGenres.length) {
      return acc;
    }

    return movieGenres.reduce<Record<string, number>>((nested, genre) => {
      const current = nested[genre] ?? 0;
      return {
        ...nested,
        [genre]: current + base,
      };
    }, acc);
  }, {});

  const criterionAverages = aggregateRatings(profile.ratings);

  const prefersEvening =
    profile.preferences.preferredTimeStart != null
      ? profile.preferences.preferredTimeStart >= EVENING_START_HOUR
      : profile.ratings.length > 0
        ? criterionAverages.overall >= 3.5
        : true;

  return {
    genreAffinity,
    criterionAverages,
    prefersEvening,
  };
};

