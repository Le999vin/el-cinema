import { MovieCard } from "@/components/movies/movie-card";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getMovies } from "@/features/movies/get-movies";
import { loadMoviesCatalog } from "@/features/catalog/load-catalog";
import { parseMoviesPageSearchParams, type PageSearchParamsInput } from "@/lib/page-search-params";

interface MoviesPageProps {
  searchParams?: PageSearchParamsInput;
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const { search, genre, sort } = await parseMoviesPageSearchParams(searchParams);

  const [movies, catalog] = await Promise.all([
    getMovies({ search, genres: genre ? [genre] : [], sort }),
    loadMoviesCatalog(),
  ]);

  const genres = [...new Set(catalog.flatMap((movie) => movie.genres))].sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-6">
      <Card>
        <form className="grid gap-3 md:grid-cols-[1fr_200px_180px]" action="/movies" method="GET">
          <label className="space-y-2">
            <span className="text-sm text-[color:var(--text-secondary)]">Search movies</span>
            <Input id="movies-search" name="search" defaultValue={search} placeholder="Search title, overview, or mood" />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-[color:var(--text-secondary)]">Genre</span>
            <Select id="movies-genre" name="genre" defaultValue={genre}>
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
            <Select id="movies-sort" name="sort" defaultValue={sort}>
              <option value="release-date">Newest</option>
              <option value="title">Title</option>
              <option value="runtime">Runtime</option>
            </Select>
          </label>
        </form>
      </Card>

      {movies.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-[color:var(--text-muted)]">No movies match your current filters.</p>
        </Card>
      )}
    </div>
  );
}
