import { CinemaGridWithMap } from "@/components/cinemas/cinema-grid-with-map";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getCinemasPageData } from "@/features/cinemas/get-cinemas";
import { parseCinemasPageSearchParams, type PageSearchParamsInput } from "@/lib/page-search-params";

interface CinemasPageProps {
  searchParams?: PageSearchParamsInput;
}

export default async function CinemasPage({ searchParams }: CinemasPageProps) {
  const { search, sort, view } = await parseCinemasPageSearchParams(searchParams);
  const { summaries, mapCinemas } = await getCinemasPageData({ search, sort });

  return (
    <div className="space-y-6">
      <Card>
        <form className="grid gap-3 md:grid-cols-[1fr_180px]" action="/cinemas" method="GET">
          <input type="hidden" name="view" value={view} />
          <label className="space-y-2">
            <span className="text-sm text-[color:var(--text-secondary)]">Search cinemas</span>
            <Input
              id="cinemas-search"
              name="search"
              defaultValue={search}
              placeholder="Search Swiss cinemas by name, city, district, or address"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-[color:var(--text-secondary)]">Sort by</span>
            <Select id="cinemas-sort" name="sort" defaultValue={sort}>
              <option value="name">Name</option>
              <option value="showtimes">Activity</option>
            </Select>
          </label>
        </form>
      </Card>

      <CinemaGridWithMap summaries={summaries} mapCinemas={mapCinemas} initialView={view} />
    </div>
  );
}
