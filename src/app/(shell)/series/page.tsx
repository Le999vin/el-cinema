import { SeriesCard } from "@/components/series/series-card";
import { Card } from "@/components/ui/card";
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
        <form className="grid gap-3 md:grid-cols-[1fr_200px_180px]" action="/series" method="GET">
          <input
            name="search"
            defaultValue={search}
            placeholder="Search title, overview, or mood"
            className="h-11 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-4 text-sm"
          />
          <select
            name="genre"
            defaultValue={genre}
            className="h-11 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-3 text-sm"
          >
            <option value="">All genres</option>
            {genres.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
          <select
            name="sort"
            defaultValue={sort}
            className="h-11 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-3 text-sm"
          >
            <option value="release-date">Sort: Newest</option>
            <option value="title">Sort: Title</option>
            <option value="runtime">Sort: Runtime</option>
          </select>
        </form>
      </Card>

      {series.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {series.map((entry) => (
            <SeriesCard key={entry.id} series={entry} />
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-[color:var(--text-muted)]">No series match your current filters.</p>
        </Card>
      )}
    </div>
  );
}
