import { Film } from "lucide-react";

import { MoviesFilterBar } from "@/components/movies/movies-filter-bar";
import { MovieCard } from "@/components/movies/movie-card";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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
        <MoviesFilterBar
          defaultSearch={search}
          defaultGenre={genre}
          defaultSort={sort}
          genres={genres}
        />
      </Card>

      {movies.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={Film}
            title="No movies found"
            description="Try adjusting your filters or clearing the search"
          />
        </Card>
      )}
    </div>
  );
}
