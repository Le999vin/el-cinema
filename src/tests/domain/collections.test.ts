import { describe, expect, it } from "vitest";

import { upsertRating, toggleId } from "@/domain/logic/collections";
import type { UserRating } from "@/domain/types";

describe("immutable collection operations", () => {
  it("toggles IDs immutably", () => {
    const start = ["a", "b"];
    const added = toggleId(start, "c");
    const removed = toggleId(added, "b");

    expect(start).toEqual(["a", "b"]);
    expect(added).toEqual(["a", "b", "c"]);
    expect(removed).toEqual(["a", "c"]);
  });

  it("upserts ratings immutably", () => {
    const base: UserRating[] = [
      {
        userId: "u",
        movieId: "m1",
        story: 3,
        tension: 3,
        acting: 3,
        visuals: 3,
        soundtrack: 3,
        overall: 3,
        note: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const next = upsertRating(base, {
      ...base[0],
      overall: 4.5,
      updatedAt: new Date(),
    });

    expect(base[0].overall).toBe(3);
    expect(next[0].overall).toBe(4.5);
  });
});

