import { aggregateRatings } from "@/domain/logic/ratings";
import type { DashboardStats, Movie, Showtime, UserProfile } from "@/domain/types";

export const computeDashboardStats = (
  profile: UserProfile,
  movies: readonly Movie[],
  showtimes: readonly Showtime[],
  now: Date,
): DashboardStats => {
  const ratingAggregate = aggregateRatings(profile.ratings);
  const upcomingShowtimes = showtimes.filter(
    (showtime) => showtime.startsAt >= now && profile.watchlistMovieIds.includes(showtime.movieId),
  );

  const movieMap = new Map(movies.map((movie) => [movie.id, movie]));

  const topGenres = profile.ratings
    .flatMap((rating) => movieMap.get(rating.movieId)?.genres ?? [])
    .reduce<Record<string, number>>((acc, genre) => ({ ...acc, [genre]: (acc[genre] ?? 0) + 1 }), {})
  ;

  return {
    watchlistCount: profile.watchlistMovieIds.length,
    seenCount: profile.seenMovieIds.length,
    ratingsCount: profile.ratings.length,
    favouriteCinemaCount: profile.favouriteCinemaIds.length,
    averageOverallRating: profile.ratings.length ? ratingAggregate.overall : undefined,
    topGenres: Object.entries(topGenres)
      .map(([genre, score]) => ({ genre, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5),
    totalUpcomingShowtimes: upcomingShowtimes.length,
  };
};

