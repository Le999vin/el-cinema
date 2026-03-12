import { defaultRecommendationWeights, recommend } from "@/domain/logic/recommendation";
import type { RecommendationResult } from "@/domain/types";
import { loadCinemasCatalog, loadMoviesCatalog, loadShowtimesCatalog } from "@/features/catalog/load-catalog";
import { hasDatabase } from "@/lib/env";
import { getUserProfile } from "@/services/db/repositories/user-repository";

export const getRecommendationsForUser = async (userId: string, limit = 5): Promise<RecommendationResult[]> => {
  if (!hasDatabase) {
    return [];
  }

  const profile = await getUserProfile(userId);
  if (!profile) {
    return [];
  }

  const [cinemas, movies, showtimes] = await Promise.all([
    loadCinemasCatalog(),
    loadMoviesCatalog(),
    loadShowtimesCatalog(),
  ]);

  return recommend(
    {
      profile,
      cinemas,
      movies,
      showtimes,
      now: new Date(),
    },
    defaultRecommendationWeights,
    limit,
  );
};

