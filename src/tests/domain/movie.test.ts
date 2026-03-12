import { describe, expect, it } from "vitest";

import { createGenreFilter, createMovieSearchFilter, sortMovies } from "@/domain/logic/movie";
import { demoMovies } from "@/lib/dev-seed-data";

describe("movie logic", () => {
  it("filters movies by genre", () => {
    const filter = createGenreFilter(["Drama"]);
    const result = demoMovies.filter(filter);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((movie) => movie.genres.includes("Drama"))).toBe(true);
  });

  it("filters movies by free text query", () => {
    const filter = createMovieSearchFilter("oppenheimer");
    const result = demoMovies.filter(filter);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Oppenheimer");
  });

  it("sorts movies by runtime descending", () => {
    const sorted = sortMovies(demoMovies, "runtime");
    expect((sorted[0].runtimeMinutes ?? 0) >= (sorted[1].runtimeMinutes ?? 0)).toBe(true);
  });
});

