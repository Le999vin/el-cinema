import { describe, expect, it } from "vitest";

import { buildCinemaSearchHaystack, buildCinemaSearchVariants } from "@/lib/cinema-search";

describe("cinema search normalization", () => {
  it("generates robust variants for umlauted Swiss place names", () => {
    expect(buildCinemaSearchVariants("Wädenswil")).toEqual(["wädenswil", "wadenswil", "waedenswil"]);
    expect(buildCinemaSearchVariants("waedenswil")).toEqual(["waedenswil"]);
  });

  it("builds a fallback matcher haystack that covers accent-folded and umlaut-expanded forms", () => {
    const haystack = buildCinemaSearchHaystack("Schloss Cinéma", "Schönenbergstrasse 1", "Wädenswil");

    expect(haystack).toContain("schloss cinéma");
    expect(haystack).toContain("schloss cinema");
    expect(haystack).toContain("wädenswil");
    expect(haystack).toContain("wadenswil");
    expect(haystack).toContain("waedenswil");
  });
});
