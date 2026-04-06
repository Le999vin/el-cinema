import { ShowtimesTable } from "@/components/showtimes/showtimes-table";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { loadCinemasCatalog, loadMoviesCatalog } from "@/features/catalog/load-catalog";
import { getShowtimeRows } from "@/features/showtimes/get-showtimes";
import { HOUR_OPTIONS } from "@/lib/forms";
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
      <Card className="sticky top-[88px] z-10">
        <form className="grid gap-3 lg:grid-cols-[160px_1fr_1fr_130px_130px]" action="/showtimes" method="GET">
          <label className="space-y-2">
            <span className="text-sm text-[color:var(--text-secondary)]">When</span>
            <Select id="showtimes-mode" name="mode" defaultValue={mode}>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="week">This week</option>
            </Select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-[color:var(--text-secondary)]">Movie</span>
            <Select id="showtimes-movie" name="movieId" defaultValue={movieId}>
              <option value="">All movies</option>
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>
                  {movie.title}
                </option>
              ))}
            </Select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-[color:var(--text-secondary)]">Cinema</span>
            <Select id="showtimes-cinema" name="cinemaId" defaultValue={cinemaId}>
              <option value="">All cinemas</option>
              {cinemas.map((cinema) => (
                <option key={cinema.id} value={cinema.id}>
                  {cinema.name}
                </option>
              ))}
            </Select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-[color:var(--text-secondary)]">Start after</span>
            <Select id="showtimes-start" name="timeStart" defaultValue={timeStart != null ? String(timeStart) : ""}>
              <option value="">Any time</option>
              {HOUR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-[color:var(--text-secondary)]">Finish by</span>
            <Select id="showtimes-end" name="timeEnd" defaultValue={timeEnd != null ? String(timeEnd) : ""}>
              <option value="">Any time</option>
              {HOUR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
        </form>
      </Card>

      <ShowtimesTable rows={rows} />
    </div>
  );
}
