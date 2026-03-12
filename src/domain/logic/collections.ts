import type { UserRating } from "@/domain/types";

export const addUnique = <T>(items: readonly T[], item: T, isSame: (left: T, right: T) => boolean): T[] =>
  items.some((existing) => isSame(existing, item)) ? [...items] : [...items, item];

export const removeMatching = <T>(items: readonly T[], predicate: (item: T) => boolean): T[] =>
  items.filter((item) => !predicate(item));

export const toggleId = (ids: readonly string[], targetId: string): string[] =>
  ids.includes(targetId) ? ids.filter((id) => id !== targetId) : [...ids, targetId];

export const upsertRating = (ratings: readonly UserRating[], rating: UserRating): UserRating[] => {
  const withoutExisting = ratings.filter((existing) => existing.movieId !== rating.movieId);
  return [...withoutExisting, rating];
};

export const deleteRating = (ratings: readonly UserRating[], movieId: string): UserRating[] =>
  ratings.filter((rating) => rating.movieId !== movieId);

