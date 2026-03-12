import { describe, expect, it } from "vitest";

import { ratingInputSchema, userRatingSchema } from "@/domain/schemas";

describe("zod schemas", () => {
  it("accepts half-step ratings", () => {
    const parsed = ratingInputSchema.parse({
      movieId: "00000000-0000-4000-8000-000000000111",
      story: 4.5,
      tension: 4,
      acting: 4,
      visuals: 5,
      soundtrack: 4.5,
      overall: 4.5,
      note: "Great atmosphere",
    });

    expect(parsed.story).toBe(4.5);
  });

  it("rejects non half-step ratings", () => {
    expect(() =>
      userRatingSchema.parse({
        userId: "00000000-0000-4000-8000-000000000222",
        movieId: "00000000-0000-4000-8000-000000000333",
        story: 4.2,
        tension: 4,
        acting: 4,
        visuals: 4,
        soundtrack: 4,
        overall: 4,
        note: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toThrow();
  });
});

