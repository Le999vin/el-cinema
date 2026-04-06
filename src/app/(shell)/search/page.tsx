import Link from "next/link";

import { CinemaCard } from "@/components/cinemas/cinema-card";
import { MovieCard } from "@/components/movies/movie-card";
import { Card } from "@/components/ui/card";
import { getCinemas } from "@/features/cinemas/get-cinemas";
import { getMovies } from "@/features/movies/get-movies";
import { parseSearchPageSearchParams, type PageSearchParamsInput } from "@/lib/page-search-params";

interface SearchPageProps {
  searchParams?: PageSearchParamsInput;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { query } = await parseSearchPageSearchParams(searchParams);
  const trimmedQuery = query.trim();

  const [movies, cinemas] = trimmedQuery
    ? await Promise.all([
        getMovies({ search: trimmedQuery, sort: "release-date" }),
        getCinemas({ search: trimmedQuery, sort: "showtimes" }),
      ])
    : [[], []];

  return (
    <div className="space-y-6">
      <Card className="bg-[linear-gradient(135deg,_rgba(212,162,75,0.18),_rgba(16,15,15,0.96))]">
        <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--accent-soft)]">Global search</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[color:var(--text-primary)]">
          {trimmedQuery ? `Results for “${trimmedQuery}”` : "Search the Swiss catalog"}
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-[color:var(--text-secondary)]">
          Find films you want to watch and the venues that fit your next cinema night.
        </p>
      </Card>

      {!trimmedQuery ? (
        <Card>
          <p className="text-sm text-[color:var(--text-muted)]">
            Use the search field in the top bar to look for a film title, venue, district, or city.
          </p>
        </Card>
      ) : null}

      {trimmedQuery ? (
        <>
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-3xl">Movies</h3>
                <p className="text-sm text-[color:var(--text-muted)]">
                  {movies.length ? `${movies.length} matching titles` : "No movie matches yet"}
                </p>
              </div>
              <Link href={`/movies?search=${encodeURIComponent(trimmedQuery)}`} className="text-sm text-[color:var(--accent-soft)]">
                Open movies page
              </Link>
            </div>
            {movies.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <Card>
                <p className="text-sm text-[color:var(--text-muted)]">
                  No movie matched this search. Try a broader title, genre, or director-adjacent keyword.
                </p>
              </Card>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-3xl">Cinemas</h3>
                <p className="text-sm text-[color:var(--text-muted)]">
                  {cinemas.length ? `${cinemas.length} matching venues` : "No cinema matches yet"}
                </p>
              </div>
              <Link href={`/cinemas?search=${encodeURIComponent(trimmedQuery)}`} className="text-sm text-[color:var(--accent-soft)]">
                Open cinemas page
              </Link>
            </div>
            {cinemas.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {cinemas.map((cinema) => (
                  <CinemaCard key={cinema.id} cinema={cinema} />
                ))}
              </div>
            ) : (
              <Card>
                <p className="text-sm text-[color:var(--text-muted)]">
                  No venue matched this search. Try a city, district, chain, or more general venue name.
                </p>
              </Card>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
