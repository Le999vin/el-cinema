import { SeriesCard } from "@/components/series/series-card";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
          <label className="space-y-2">
            <span className="text-sm text-[color:var(--text-secondary)]">Search series</span>
            <Input id="series-search" name="search" defaultValue={search} placeholder="Search title, overview, or mood" />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-[color:var(--text-secondary)]">Genre</span>
            <Select id="series-genre" name="genre" defaultValue={genre}>
              <option value="">All genres</option>
              {genres.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-2">
            <span className="text-sm text-[color:var(--text-secondary)]">Sort by</span>
            <Select id="series-sort" name="sort" defaultValue={sort}>
              <option value="release-date">Newest</option>
              <option value="title">Title</option>
              <option value="runtime">Runtime</option>
            </Select>
          </label>
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
