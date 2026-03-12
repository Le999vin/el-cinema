import { differenceInHours } from "date-fns";

import { createUpcomingFilter, createTimeWindowFilter } from "@/domain/logic/showtime";
import { deriveTasteProfile } from "@/domain/logic/taste-profile";
import type {
  RecommendationCandidate,
  RecommendationInput,
  RecommendationReason,
  RecommendationResult,
  RecommendationWeights,
} from "@/domain/types";
import { roundTo } from "@/lib/utils";

export const defaultRecommendationWeights: RecommendationWeights = {
  genreWeight: 0.3,
  ratingHistoryWeight: 0.2,
  cinemaWeight: 0.2,
  timeWeight: 0.15,
  watchlistWeight: 0.1,
  freshnessWeight: 0.05,
};

const createMovieGenreAffinity = (favouriteGenres: readonly string[]) => {
  const set = new Set(favouriteGenres.map((genre) => genre.toLowerCase()));
  return (genres: readonly string[]): number => {
    if (!genres.length || !set.size) {
      return 0;
    }

    const matchCount = genres.filter((genre) => set.has(genre.toLowerCase())).length;
    return matchCount / genres.length;
  };
};

const createRatingHistoryScore = (averageOverall: number) => (movieVoteAverage?: number | null): number => {
  if (!movieVoteAverage) {
    return averageOverall / 5;
  }

  const normalizedVote = movieVoteAverage / 10;
  const normalizedUser = averageOverall / 5;
  return (normalizedVote + normalizedUser) / 2;
};

const createCinemaPreferenceScore = (favouriteCinemaIds: readonly string[]) => {
  const set = new Set(favouriteCinemaIds);
  return (cinemaId: string): number => (set.has(cinemaId) ? 1 : 0);
};

const createTimePreferenceScore = (startHour?: number | null, endHour?: number | null) => {
  const matcher = createTimeWindowFilter(startHour, endHour);
  return (candidate: RecommendationCandidate): number => (matcher(candidate.showtime) ? 1 : 0);
};

const createWatchlistSignal = (watchlistMovieIds: readonly string[]) => {
  const set = new Set(watchlistMovieIds);
  return (movieId: string): number => (set.has(movieId) ? 1 : 0);
};

const freshnessScore = (startsAt: Date, now: Date): number => {
  const hoursAway = differenceInHours(startsAt, now);

  if (hoursAway < 0) {
    return 0;
  }

  if (hoursAway <= 6) {
    return 1;
  }

  if (hoursAway <= 24) {
    return 0.8;
  }

  if (hoursAway <= 72) {
    return 0.6;
  }

  return 0.4;
};

export const createRecommendationScorer = (weights: RecommendationWeights, input: RecommendationInput) => {
  const tasteProfile = deriveTasteProfile(input.profile);
  const genreAffinityScore = createMovieGenreAffinity(input.profile.preferences.favouriteGenres);
  const historyScore = createRatingHistoryScore(tasteProfile.criterionAverages.overall || 3.5);
  const cinemaScore = createCinemaPreferenceScore(input.profile.favouriteCinemaIds);
  const timeScore = createTimePreferenceScore(
    input.profile.preferences.preferredTimeStart,
    input.profile.preferences.preferredTimeEnd,
  );
  const watchlistScore = createWatchlistSignal(input.profile.watchlistMovieIds);

  return (candidate: RecommendationCandidate): number => {
    const genre = genreAffinityScore(candidate.movie.genres);
    const ratingHistory = historyScore(candidate.movie.voteAverage);
    const cinema = cinemaScore(candidate.cinema.id);
    const timing = timeScore(candidate);
    const watchlist = watchlistScore(candidate.movie.id);
    const freshness = freshnessScore(candidate.showtime.startsAt, input.now);

    const weighted =
      genre * weights.genreWeight +
      ratingHistory * weights.ratingHistoryWeight +
      cinema * weights.cinemaWeight +
      timing * weights.timeWeight +
      watchlist * weights.watchlistWeight +
      freshness * weights.freshnessWeight;

    return roundTo(weighted, 4);
  };
};

export const buildRecommendationReasons = (
  candidate: RecommendationCandidate,
  score: number,
  input: RecommendationInput,
): RecommendationReason[] => {
  const reasons: RecommendationReason[] = [];

  if (candidate.movie.genres.some((genre) => input.profile.preferences.favouriteGenres.includes(genre))) {
    reasons.push({
      kind: "genre",
      message: `You consistently favour ${candidate.movie.genres.find((genre) => input.profile.preferences.favouriteGenres.includes(genre))} titles.`,
    });
  }

  if (input.profile.favouriteCinemaIds.includes(candidate.cinema.id)) {
    reasons.push({
      kind: "cinema",
      message: `${candidate.cinema.name} is in your favourite cinema list.`,
    });
  }

  if (input.profile.watchlistMovieIds.includes(candidate.movie.id)) {
    reasons.push({
      kind: "watchlist",
      message: "You already saved this film to your watchlist.",
    });
  }

  const startsAtHour = candidate.showtime.startsAt.getHours();
  const { preferredTimeStart, preferredTimeEnd } = input.profile.preferences;
  if (preferredTimeStart != null && preferredTimeEnd != null) {
    const inRange =
      preferredTimeStart <= preferredTimeEnd
        ? startsAtHour >= preferredTimeStart && startsAtHour <= preferredTimeEnd
        : startsAtHour >= preferredTimeStart || startsAtHour <= preferredTimeEnd;

    if (inRange) {
      reasons.push({
        kind: "time-window",
        message: "This showtime aligns with your preferred viewing hours.",
      });
    }
  }

  if (score >= 0.75) {
    reasons.push({
      kind: "rating-history",
      message: "Your past ratings indicate strong affinity for this profile.",
    });
  }

  reasons.push({
    kind: "freshness",
    message: "Scheduled soon enough to fit your next cinema window.",
  });

  return reasons.slice(0, 3);
};

export const buildRecommendationCandidates = (input: RecommendationInput): RecommendationCandidate[] => {
  const movieMap = new Map(input.movies.map((movie) => [movie.id, movie]));
  const cinemaMap = new Map(input.cinemas.map((cinema) => [cinema.id, cinema]));
  const isUpcoming = createUpcomingFilter(input.now);
  const seenMovieSet = new Set(input.profile.seenMovieIds);

  return input.showtimes
    .filter(isUpcoming)
    .map((showtime) => ({
      showtime,
      movie: movieMap.get(showtime.movieId),
      cinema: cinemaMap.get(showtime.cinemaId),
    }))
    .filter((item): item is { showtime: RecommendationCandidate["showtime"]; movie: RecommendationCandidate["movie"]; cinema: RecommendationCandidate["cinema"] } =>
      Boolean(item.movie && item.cinema),
    )
    .filter((candidate) => !seenMovieSet.has(candidate.movie.id));
};

export const recommend = (
  input: RecommendationInput,
  weights: RecommendationWeights = defaultRecommendationWeights,
  limit = 5,
): RecommendationResult[] => {
  const scorer = createRecommendationScorer(weights, input);

  return buildRecommendationCandidates(input)
    .map((candidate) => {
      const score = scorer(candidate);
      return {
        movie: candidate.movie,
        cinema: candidate.cinema,
        showtime: candidate.showtime,
        score,
        reasons: buildRecommendationReasons(candidate, score, input),
      } satisfies RecommendationResult;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

