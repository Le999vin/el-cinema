import { describe, expect, it } from "vitest";

import { aggregateRatings, createRatingSorter } from "@/domain/logic/ratings";
import type { UserRating } from "@/domain/types";

const ratings: UserRating[] = [
  {
    userId: "u",
    movieId: "m1",
    story: 4,
    tension: 3.5,
    acting: 4.5,
    visuals: 4,
    soundtrack: 3,
    overall: 4,
    note: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: "u",
    movieId: "m2",
    story: 3,
    tension: 3,
    acting: 3.5,
    visuals: 3,
    soundtrack: 2.5,
    overall: 3,
    note: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("rating aggregations", () => {
  it("computes criterion averages", () => {
    const summary = aggregateRatings(ratings);
    expect(summary.overall).toBe(3.5);
    expect(summary.acting).toBe(4);
  });

  it("sorts ratings by selected criterion", () => {
    const sorted = [...ratings].sort(createRatingSorter("overall"));
    expect(sorted[0].overall).toBeGreaterThan(sorted[1].overall);
  });
});

