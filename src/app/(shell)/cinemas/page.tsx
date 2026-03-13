import { CinemaGridWithMap } from "@/components/cinemas/cinema-grid-with-map";
import { Card } from "@/components/ui/card";
import { getCinemas } from "@/features/cinemas/get-cinemas";
import { loadCinemasCatalog } from "@/features/catalog/load-catalog";
import { parseCinemasPageSearchParams, type PageSearchParamsInput } from "@/lib/page-search-params";

interface CinemasPageProps {
  searchParams?: PageSearchParamsInput;
}

export default async function CinemasPage({ searchParams }: CinemasPageProps) {
  const { search, sort } = await parseCinemasPageSearchParams(searchParams);

  const [summaries, mapCinemas] = await Promise.all([
    getCinemas({ search, sort }),
    loadCinemasCatalog(),
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <form className="grid gap-3 md:grid-cols-[1fr_180px]" action="/cinemas" method="GET">
          <input
            name="search"
            defaultValue={search}
            placeholder="Search by name, district, or address"
            className="h-11 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-4 text-sm"
          />
          <select
            name="sort"
            defaultValue={sort}
            className="h-11 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-3 text-sm"
          >
            <option value="name">Sort: Name</option>
            <option value="showtimes">Sort: Activity</option>
          </select>
        </form>
      </Card>

      <CinemaGridWithMap summaries={summaries} mapCinemas={mapCinemas} />
    </div>
  );
}
