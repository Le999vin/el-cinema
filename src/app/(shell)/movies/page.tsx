import { MovieCard } from "@/components/movies/movie-card";
import { Card } from "@/components/ui/card";
import { getMovies } from "@/features/movies/get-movies";
import { loadMoviesCatalog } from "@/features/catalog/load-catalog";

interface MoviesPageProps {
  searchParams?: {
    search?: string;
    genre?: string;
    sort?: "title" | "release-date" | "runtime";
  };
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const search = searchParams?.search ?? "";
  const genre = searchParams?.genre ?? "";
  const sort = searchParams?.sort ?? "release-date";

  const [movies, catalog] = await Promise.all([
    getMovies({ search, genres: genre ? [genre] : [], sort }),
    loadMoviesCatalog(),
  ]);

  const genres = [...new Set(catalog.flatMap((movie) => movie.genres))].sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-6">
      <Card>
        <form className="grid gap-3 md:grid-cols-[1fr_200px_180px]" action="/movies" method="GET">
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}

