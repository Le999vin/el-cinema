import { afterEach, describe, expect, it, vi } from "vitest";

import type { Series } from "@/domain/types";

vi.mock("@/lib/env", () => ({
  hasDatabase: true,
}));

vi.mock("@/features/catalog/enrich-catalog", () => ({
  ensureSeriesSearchResults: vi.fn(),
  ensureSeriesDetailsFresh: vi.fn(),
}));

vi.mock("@/services/db/repositories/series-repository", () => ({
  querySeries: vi.fn(),
}));

import { ensureSeriesSearchResults } from "@/features/catalog/enrich-catalog";
import { getSeries } from "@/features/series/get-series";
import { querySeries } from "@/services/db/repositories/series-repository";

const demoSeries: Series[] = [
  {
    id: "series-1",
    tmdbId: 100,
    name: "The Last of Us",
    overview: "After civilization collapses, a smuggler protects a young girl.",
    genres: ["Drama", "Sci-Fi & Fantasy"],
    episodeRuntimeMinutes: 58,
    posterUrl: "https://image.tmdb.org/t/p/w780/demo-1.jpg",
    backdropUrl: null,
    firstAirDate: "2023-01-15",
    voteAverage: 8.7,
    numberOfSeasons: 2,
    numberOfEpisodes: 16,
    sourceUpdatedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "series-2",
    tmdbId: 200,
    name: "Severance",
    overview: "Office workers surgically split their memories between work and personal life.",
    genres: ["Drama", "Mystery"],
    episodeRuntimeMinutes: 50,
    posterUrl: "https://image.tmdb.org/t/p/w780/demo-2.jpg",
    backdropUrl: null,
    firstAirDate: "2022-02-18",
    voteAverage: 8.4,
    numberOfSeasons: 2,
    numberOfEpisodes: 19,
    sourceUpdatedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("getSeries", () => {
  const mockedQuerySeries = vi.mocked(querySeries);
  const mockedEnsureSeriesSearchResults = vi.mocked(ensureSeriesSearchResults);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("enriches from TMDb for free-text searches before querying the DB-backed series catalog", async () => {
    mockedQuerySeries.mockResolvedValue([demoSeries[0]]);

    const result = await getSeries({ search: "last", sort: "release-date" });

    expect(mockedEnsureSeriesSearchResults).toHaveBeenCalledWith("last");
    expect(mockedQuerySeries).toHaveBeenCalledWith({ search: "last", sort: "release-date" });
    expect(result[0].name).toBe("The Last of Us");
  });

  it("passes genre filtering through to the repository query", async () => {
    mockedQuerySeries.mockResolvedValue([demoSeries[1]]);

    const result = await getSeries({ genres: ["Mystery"], sort: "title" });

    expect(mockedQuerySeries).toHaveBeenCalledWith({ genres: ["Mystery"], sort: "title" });
    expect(result.map((entry) => entry.name)).toEqual(["Severance"]);
  });
});
