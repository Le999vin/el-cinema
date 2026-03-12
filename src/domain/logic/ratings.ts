import { roundTo } from "@/lib/utils";

import type { UserRating } from "@/domain/types";

const ratingCriteria = ["story", "tension", "acting", "visuals", "soundtrack", "overall"] as const;

export const aggregateRatings = (ratings: readonly UserRating[]) => {
  if (!ratings.length) {
    return {
      story: 0,
      tension: 0,
      acting: 0,
      visuals: 0,
      soundtrack: 0,
      overall: 0,
    };
  }

  const totals = ratings.reduce(
    (acc, rating) => ({
      story: acc.story + rating.story,
      tension: acc.tension + rating.tension,
      acting: acc.acting + rating.acting,
      visuals: acc.visuals + rating.visuals,
      soundtrack: acc.soundtrack + rating.soundtrack,
      overall: acc.overall + rating.overall,
    }),
    {
      story: 0,
      tension: 0,
      acting: 0,
      visuals: 0,
      soundtrack: 0,
      overall: 0,
    },
  );

  const count = ratings.length;

  return {
    story: roundTo(totals.story / count),
    tension: roundTo(totals.tension / count),
    acting: roundTo(totals.acting / count),
    visuals: roundTo(totals.visuals / count),
    soundtrack: roundTo(totals.soundtrack / count),
    overall: roundTo(totals.overall / count),
  };
};

export const averageRating = (rating: UserRating): number =>
  roundTo(ratingCriteria.reduce((acc, key) => acc + rating[key], 0) / ratingCriteria.length);

export const createRatingSorter = (field: (typeof ratingCriteria)[number]) =>
  (a: UserRating, b: UserRating): number => b[field] - a[field];

export const topRatedMovies = (ratings: readonly UserRating[], limit = 5): string[] =>
  [...ratings]
    .sort((a, b) => b.overall - a.overall)
    .slice(0, limit)
    .map((rating) => rating.movieId);

