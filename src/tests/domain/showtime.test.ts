import { describe, expect, it } from "vitest";

import {
  createDateRangeFilter,
  createTimeWindowFilter,
  filterShowtimes,
  sortShowtimesByStart,
} from "@/domain/logic/showtime";
import { buildDemoShowtimes } from "@/lib/dev-seed-data";

describe("showtime logic", () => {
  it("filters showtimes in today's range", () => {
    const showtimes = buildDemoShowtimes();
    const todayFilter = createDateRangeFilter("today", new Date());

    const result = filterShowtimes(showtimes, [todayFilter]);
    expect(result.length).toBeGreaterThan(0);
  });

  it("filters showtimes by time window", () => {
    const showtimes = buildDemoShowtimes();
    const eveningFilter = createTimeWindowFilter(18, 23);

    const result = showtimes.filter(eveningFilter);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((entry) => entry.startsAt.getHours() >= 18 || entry.startsAt.getHours() <= 23)).toBe(true);
  });

  it("sorts showtimes chronologically", () => {
    const sorted = sortShowtimesByStart(buildDemoShowtimes());
    expect(sorted[0].startsAt.getTime()).toBeLessThanOrEqual(sorted[1].startsAt.getTime());
  });
});

