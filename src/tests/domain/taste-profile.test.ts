import { describe, expect, it } from "vitest";

import { deriveTasteProfile } from "@/domain/logic/taste-profile";
import type { UserProfile } from "@/domain/types";

const profile: UserProfile = {
  user: { id: "u", email: "u@example.com", displayName: "U", role: "user" },
  preferences: {
    userId: "u",
    favouriteGenres: ["Science Fiction", "Drama"],
    preferredTimeStart: 19,
    preferredTimeEnd: 23,
    preferredCinemaIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  favouriteCinemaIds: [],
  watchlistMovieIds: [],
  seenMovieIds: [],
  ratings: [
    {
      userId: "u",
      movieId: "m1",
      story: 4,
      tension: 4,
      acting: 4,
      visuals: 4,
      soundtrack: 4,
      overall: 4,
      note: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};

describe("taste profile derivation", () => {
  it("builds aggregate profile with criterion means", () => {
    const taste = deriveTasteProfile(profile);
    expect(taste.criterionAverages.overall).toBe(4);
    expect(taste.prefersEvening).toBe(true);
  });
});

