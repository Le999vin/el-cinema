import { CinemasFilterBar } from "@/components/cinemas/cinemas-filter-bar";
import { CinemaGridWithMap } from "@/components/cinemas/cinema-grid-with-map";
import { Card } from "@/components/ui/card";
import { getCinemasPageData } from "@/features/cinemas/get-cinemas";
import { parseCinemasPageSearchParams, type PageSearchParamsInput } from "@/lib/page-search-params";

interface CinemasPageProps {
  searchParams?: PageSearchParamsInput;
}

export default async function CinemasPage({ searchParams }: CinemasPageProps) {
  const { search, sort } = await parseCinemasPageSearchParams(searchParams);
  const { summaries, mapCinemas } = await getCinemasPageData({ search, sort });

  return (
    <div className="space-y-6">
      <Card>
        <CinemasFilterBar defaultSearch={search} defaultSort={sort} />
      </Card>

      <CinemaGridWithMap summaries={summaries} mapCinemas={mapCinemas} />
    </div>
  );
}
