import { ShowtimesTable } from "@/components/showtimes/showtimes-table";
import { Card } from "@/components/ui/card";
import { loadCinemasCatalog, loadMoviesCatalog } from "@/features/catalog/load-catalog";
import { getShowtimeRows } from "@/features/showtimes/get-showtimes";

interface ShowtimesPageProps {
  searchParams?: {
    mode?: "today" | "tomorrow" | "week";
    movieId?: string;
    cinemaId?: string;
    timeStart?: string;
    timeEnd?: string;
  };
}

export default async function ShowtimesPage({ searchParams }: ShowtimesPageProps) {
  const mode = searchParams?.mode ?? "today";
  const movieId = searchParams?.movieId ?? "";
  const cinemaId = searchParams?.cinemaId ?? "";
  const timeStart = searchParams?.timeStart ? Number(searchParams.timeStart) : undefined;
  const timeEnd = searchParams?.timeEnd ? Number(searchParams.timeEnd) : undefined;

  const [rows, cinemas, movies] = await Promise.all([
    getShowtimeRows({ mode, movieId: movieId || undefined, cinemaId: cinemaId || undefined, timeStart, timeEnd }),
    loadCinemasCatalog(),
    loadMoviesCatalog(),
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <form className="grid gap-3 lg:grid-cols-[160px_1fr_1fr_130px_130px]" action="/showtimes" method="GET">
          <select name="mode" defaultValue={mode} className="h-11 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-3 text-sm">
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="week">This Week</option>
          </select>

          <select name="movieId" defaultValue={movieId} className="h-11 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-3 text-sm">
            <option value="">All movies</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title}
              </option>
            ))}
          </select>

          <select name="cinemaId" defaultValue={cinemaId} className="h-11 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-3 text-sm">
            <option value="">All cinemas</option>
            {cinemas.map((cinema) => (
              <option key={cinema.id} value={cinema.id}>
                {cinema.name}
              </option>
            ))}
          </select>

          <input
            name="timeStart"
            type="number"
            min={0}
            max={23}
            placeholder="From"
            defaultValue={timeStart}
            className="h-11 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-3 text-sm"
          />

          <input
            name="timeEnd"
            type="number"
            min={0}
            max={23}
            placeholder="To"
            defaultValue={timeEnd}
            className="h-11 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-3 text-sm"
          />
        </form>
      </Card>

      <ShowtimesTable rows={rows} />
    </div>
  );
}

