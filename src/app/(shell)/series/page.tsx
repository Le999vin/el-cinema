import { Tv } from "lucide-react";

import { SeriesFilterBar } from "@/components/series/series-filter-bar";
import { SeriesCard } from "@/components/series/series-card";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { loadSeriesCatalog } from "@/features/catalog/load-catalog";
import { getSeries } from "@/features/series/get-series";
import { parseSeriesPageSearchParams, type PageSearchParamsInput } from "@/lib/page-search-params";

interface SeriesPageProps {
  searchParams?: PageSearchParamsInput;
}

export default async function SeriesPage({ searchParams }: SeriesPageProps) {
  const { search, genre, sort } = await parseSeriesPageSearchParams(searchParams);

  const [series, catalog] = await Promise.all([
    getSeries({ search, genres: genre ? [genre] : [], sort }),
    loadSeriesCatalog(),
  ]);

  const genres = [...new Set(catalog.flatMap((entry) => entry.genres))].sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-6">
      <Card>
        <SeriesFilterBar
          defaultSearch={search}
          defaultGenre={genre}
          defaultSort={sort}
          genres={genres}
        />
      </Card>

      {series.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {series.map((entry) => (
            <SeriesCard key={entry.id} series={entry} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={Tv}
            title="No series found"
            description="Try adjusting your filters or clearing the search"
          />
        </Card>
      )}
    </div>
  );
}
