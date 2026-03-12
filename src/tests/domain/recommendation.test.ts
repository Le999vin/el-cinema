import { describe, expect, it } from "vitest";

import { defaultRecommendationWeights, recommend } from "@/domain/logic/recommendation";
import type { RecommendationInput, UserProfile } from "@/domain/types";
import { demoCinemas, demoMovies, buildDemoShowtimes } from "@/lib/dev-seed-data";

const profile: UserProfile = {
  user: {
    id: "5cbf8ebb-42f5-43f2-98d3-f64feecf0a7c",
    email: "test@cinemascope.ch",
    displayName: "Test",
    role: "user",
  },
  preferences: {
    userId: "5cbf8ebb-42f5-43f2-98d3-f64feecf0a7c",
    favouriteGenres: ["Science Fiction", "Drama"],
    preferredTimeStart: 18,
    preferredTimeEnd: 23,
    preferredCinemaIds: [demoCinemas[0].id],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  favouriteCinemaIds: [demoCinemas[0].id],
  watchlistMovieIds: [demoMovies[0].id],
  seenMovieIds: [],
  ratings: [],
};

const input: RecommendationInput = {
  profile,
  cinemas: demoCinemas,
  movies: demoMovies,
  showtimes: buildDemoShowtimes(),
  now: new Date(),
};

describe("recommendation engine", () => {
  it("returns ranked recommendations", () => {
    const results = recommend(input, defaultRecommendationWeights, 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
  });

  it("generates human-readable reasons", () => {
    const [top] = recommend(input, defaultRecommendationWeights, 1);
    expect(top.reasons.length).toBeGreaterThan(0);
    expect(top.reasons.some((reason) => reason.message.length > 10)).toBe(true);
  });
});

