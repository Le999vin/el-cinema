import { Calendar } from "lucide-react";

import { ShowtimesFilterBar } from "@/components/showtimes/showtimes-filter-bar";
import { ShowtimesTable } from "@/components/showtimes/showtimes-table";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { loadCinemasCatalog, loadMoviesCatalog } from "@/features/catalog/load-catalog";
import { getShowtimeRows } from "@/features/showtimes/get-showtimes";
import { parseShowtimesPageSearchParams, type PageSearchParamsInput } from "@/lib/page-search-params";

interface ShowtimesPageProps {
  searchParams?: PageSearchParamsInput;
}

export default async function ShowtimesPage({ searchParams }: ShowtimesPageProps) {
  const { mode, movieId, cinemaId, timeStart, timeEnd } = await parseShowtimesPageSearchParams(searchParams);

  const [rows, cinemas, movies] = await Promise.all([
    getShowtimeRows({ mode, movieId: movieId || undefined, cinemaId: cinemaId || undefined, timeStart, timeEnd }),
    loadCinemasCatalog(),
    loadMoviesCatalog(),
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <ShowtimesFilterBar
          defaultMode={mode}
          defaultMovieId={movieId}
          defaultCinemaId={cinemaId}
          defaultTimeStart={timeStart != null ? String(timeStart) : ""}
          defaultTimeEnd={timeEnd != null ? String(timeEnd) : ""}
          movies={movies.map((m) => ({ id: m.id, title: m.title }))}
          cinemas={cinemas.map((c) => ({ id: c.id, name: c.name }))}
        />
      </Card>

      {rows.length ? (
        <ShowtimesTable rows={rows} />
      ) : (
        <Card>
          <EmptyState
            icon={Calendar}
            title="No showtimes match"
            description="Broaden your time window or change filters"
          />
        </Card>
      )}
    </div>
  );
}
