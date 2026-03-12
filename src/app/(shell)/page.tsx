import { format } from "date-fns";
import Link from "next/link";

import { CinemaCard } from "@/components/cinemas/cinema-card";
import { MovieCard } from "@/components/movies/movie-card";
import { RecommendationCard } from "@/components/recommendations/recommendation-card";
import { Card } from "@/components/ui/card";
import { getCinemas } from "@/features/cinemas/get-cinemas";
import { getMovies } from "@/features/movies/get-movies";
import { getRecommendationsForUser } from "@/features/recommendations/get-recommendations";
import { getShowtimeRows } from "@/features/showtimes/get-showtimes";
import { resolveCurrentUser } from "@/services/auth/auth-service";

export default async function HomePage() {
  const [trendingMovies, popularCinemas, upcomingRows, user] = await Promise.all([
    getMovies({ sort: "release-date" }),
    getCinemas({ sort: "name" }),
    getShowtimeRows({ mode: "today" }),
    resolveCurrentUser(),
  ]);

  const recommendations = user ? await getRecommendationsForUser(user.id, 3) : [];

  return (
    <div className="space-y-8">
      <Card className="relative overflow-hidden bg-[linear-gradient(120deg,_rgba(212,162,75,0.2),_rgba(21,19,20,0.95))]">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm uppercase tracking-[0.12em] text-[color:var(--accent-soft)]">Zurich • Curated Daily</p>
          <h2 className="font-[family-name:var(--font-display)] text-6xl leading-none text-[color:var(--text-primary)]">
            Which movie, which cinema, what time fits tonight?
          </h2>
          <p className="text-base text-[color:var(--text-secondary)]">
            CinemaScope combines trusted cinema venues, TMDb movie context, and your own rating history to suggest screenings that actually match your taste.
          </p>
          <div className="flex gap-3">
            <Link href="/showtimes" className="rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-[color:var(--accent-foreground)]">
              Browse tonight
            </Link>
            <Link href="/recommendations" className="rounded-xl border border-[color:var(--border-subtle)] px-4 py-2 text-sm text-[color:var(--text-primary)]">
              Open recommendations
            </Link>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-[color:var(--text-muted)]">Cinemas in Zurich</p>
          <p className="mt-2 text-4xl font-semibold">{popularCinemas.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-[color:var(--text-muted)]">Movies indexed</p>
          <p className="mt-2 text-4xl font-semibold">{trendingMovies.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-[color:var(--text-muted)]">Showtimes today</p>
          <p className="mt-2 text-4xl font-semibold">{upcomingRows.length}</p>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h3 className="font-[family-name:var(--font-display)] text-4xl">Trending Movies</h3>
          <Link href="/movies" className="text-sm text-[color:var(--accent-soft)]">See all</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{trendingMovies.slice(0, 6).map((movie) => <MovieCard key={movie.id} movie={movie} />)}</div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h3 className="font-[family-name:var(--font-display)] text-4xl">Popular Cinemas</h3>
          <Link href="/cinemas" className="text-sm text-[color:var(--accent-soft)]">Browse cinemas</Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">{popularCinemas.slice(0, 4).map((cinema) => <CinemaCard key={cinema.id} cinema={cinema} />)}</div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <h3 className="font-[family-name:var(--font-display)] text-3xl">Upcoming Showtimes</h3>
          <div className="mt-4 space-y-3">
            {upcomingRows.slice(0, 6).map((row) => (
              <div key={row.showtime.id} className="flex items-center justify-between rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-4 py-3">
                <div>
                  <p className="font-medium text-[color:var(--text-primary)]">{row.movie.title}</p>
                  <p className="text-xs text-[color:var(--text-muted)]">{row.cinema.name}</p>
                </div>
                <p className="text-sm text-[color:var(--accent-soft)]">{format(row.showtime.startsAt, "EEE HH:mm")}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <h3 className="font-[family-name:var(--font-display)] text-3xl">For You</h3>
          {user ? (
            recommendations.length ? (
              recommendations.map((item, index) => (
                <RecommendationCard key={item.showtime.id} recommendation={item} highlight={index === 0} />
              ))
            ) : (
              <Card>
                <p className="text-sm text-[color:var(--text-muted)]">Rate a few movies to unlock sharper recommendations.</p>
              </Card>
            )
          ) : (
            <Card>
              <p className="text-sm text-[color:var(--text-muted)]">Sign in to activate your personal recommendations.</p>
              <Link href="/login" className="mt-3 inline-block text-sm text-[color:var(--accent-soft)]">
                Go to login
              </Link>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}

