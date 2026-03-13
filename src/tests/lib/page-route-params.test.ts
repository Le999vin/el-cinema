import { describe, expect, it } from "vitest";

import { resolvePageRouteParams } from "@/lib/page-route-params";

describe("resolvePageRouteParams", () => {
  it("resolves promise-based Next route params", async () => {
    await expect(resolvePageRouteParams(Promise.resolve({ cinemaId: "cinema-1" }))).resolves.toEqual({
      cinemaId: "cinema-1",
    });
  });

  it("passes through object route params", async () => {
    await expect(resolvePageRouteParams({ movieId: "movie-1" })).resolves.toEqual({
      movieId: "movie-1",
    });
  });
});
