import { describe, expect, it } from "vitest";

import { createCityFilter, createCinemaSearchFilter, filterCinemas } from "@/domain/logic/cinema";
import { demoCinemas } from "@/lib/dev-seed-data";

describe("cinema logic", () => {
  it("filters cinemas by city with closure", () => {
    const inZurich = filterCinemas(demoCinemas, [createCityFilter("Zurich")]);
    expect(inZurich).toHaveLength(demoCinemas.length);
  });

  it("filters cinemas by search terms", () => {
    const searched = filterCinemas(demoCinemas, [createCinemaSearchFilter("Riffraff")]);
    expect(searched.map((cinema) => cinema.name)).toEqual(["Riffraff"]);
  });
});

