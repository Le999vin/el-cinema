import { CalendarClock, Clapperboard, MapPinned, Sparkles } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";

import { CinemaCard } from "@/components/cinemas/cinema-card";
import { MovieCard } from "@/components/movies/movie-card";
import { RecommendationCard } from "@/components/recommendations/recommendation-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCinemas } from "@/features/cinemas/get-cinemas";
import { getDashboardData } from "@/features/dashboard/get-dashboard-data";
import { getMovies } from "@/features/movies/get-movies";
import { getRecommendationsForUser } from "@/features/recommendations/get-recommendations";
import { getShowtimeRows } from "@/features/showtimes/get-showtimes";
import { resolveCurrentUser } from "@/services/auth/auth-service";

const showcasePositions = [
  "left-0 top-14 h-[300px] w-[200px] -rotate-[10deg] xl:h-[320px] xl:w-[212px]",
  "left-[7.75rem] top-0 z-20 h-[352px] w-[228px] xl:left-[8.5rem] xl:h-[380px] xl:w-[240px]",
  "right-0 top-16 h-[308px] w-[206px] rotate-[10deg] xl:h-[330px] xl:w-[216px]",
] as const;

const SectionHeading = ({
  eyebrow,
  title,
  actionHref,
  actionLabel,
  description,
}: {
  eyebrow: string;
  title: string;
  actionHref: string;
  actionLabel: string;
  description?: string;
}) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[color:var(--accent-soft)]">{eyebrow}</p>
      <h3 className="mt-2 font-[family-name:var(--font-display)] text-[2.2rem] leading-none text-[color:var(--text-primary)] sm:text-[2.7rem]">
        {title}
      </h3>
      {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--text-muted)]">{description}</p> : null}
    </div>
    <Link href={actionHref} className="text-sm text-[color:var(--accent-soft)] transition hover:text-[color:var(--text-primary)]">
      {actionLabel}
    </Link>
  </div>
);

export default async function HomePage() {
  const [trendingMovies, popularCinemas, upcomingRows, user] = await Promise.all([
    getMovies({ sort: "release-date" }),
    getCinemas({ sort: "name" }),
    getShowtimeRows({ mode: "today" }),
    resolveCurrentUser(),
  ]);

  const recommendations = user ? await getRecommendationsForUser(user.id, 3) : [];
  const dashboard = user ? await getDashboardData(user.id) : null;
  const posterShowcase = trendingMovies.filter((movie) => movie.posterUrl).slice(0, 3);
  const spotlightMovie = posterShowcase[0] ?? trendingMovies[0] ?? null;

  const heroStats = user && dashboard
    ? [
        { label: "Watchlist", value: dashboard.stats.watchlistCount, icon: Sparkles },
        { label: "Upcoming picks", value: dashboard.stats.totalUpcomingShowtimes, icon: CalendarClock },
        { label: "Favourite cinemas", value: dashboard.stats.favouriteCinemaCount, icon: MapPinned },
      ]
    : [
        { label: "Cinemas indexed", value: popularCinemas.length, icon: MapPinned },
        { label: "Movies indexed", value: trendingMovies.length, icon: Clapperboard },
        { label: "Showtimes today", value: upcomingRows.length, icon: CalendarClock },
      ];

  return (
    <div className="space-y-10 lg:space-y-12">
      <section className="relative overflow-hidden rounded-[36px] border border-[color:var(--border-subtle)] bg-[linear-gradient(135deg,_rgba(212,162,75,0.18),_rgba(12,11,12,0.96))] px-5 py-6 shadow-[0_28px_90px_rgba(0,0,0,0.3)] sm:px-8 sm:py-8 xl:px-10 xl:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_32%),linear-gradient(180deg,_transparent,_rgba(0,0,0,0.28))]" />

        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.06fr)_minmax(360px,0.94fr)] xl:items-end">
          <div className="max-w-2xl space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge>{user ? "Personal cinema desk" : "Zurich night planner"}</Badge>
              <Badge className="bg-black/18 text-[color:var(--text-secondary)]">
                {user ? "Recommendations live" : "Swiss catalog synced"}
              </Badge>
            </div>

            <div className="space-y-4">
              <h2 className="max-w-[12ch] font-[family-name:var(--font-display)] text-[3.25rem] leading-[0.95] text-[color:var(--text-primary)] sm:text-[4.25rem] xl:text-[5.4rem]">
                {user ? "Plan tonight's screening before the tabs pile up." : "Find the film, venue, and start time worth leaving for."}
              </h2>
              <p className="max-w-xl text-base leading-7 text-[color:var(--text-secondary)]">
                {user
                  ? "CinemaScope keeps your watchlist, taste signals, and tonight's recommendations in one calmer surface so you can decide faster."
                  : "CinemaScope combines trusted venues, TMDb context, and your own signals to make Swiss cinema discovery feel more deliberate."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/showtimes"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-[color:var(--accent-foreground)] shadow-[0_16px_36px_rgba(212,162,75,0.22)] transition hover:-translate-y-0.5 hover:bg-[color:var(--accent-strong)]"
              >
                Browse tonight
              </Link>
              <Link
                href={user ? "/recommendations" : "/login"}
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-black/14 px-5 py-3 text-sm font-semibold text-[color:var(--text-primary)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-[color:var(--accent-soft)] hover:bg-black/22"
              >
                {user ? "Open recommendations" : "Sign in for personal picks"}
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {heroStats.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-[26px] border border-[color:var(--border-subtle)] bg-black/16 px-4 py-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">{item.label}</p>
                      <Icon size={16} className="text-[color:var(--accent-soft)]" />
                    </div>
                    <p className="mt-3 text-4xl font-semibold text-[color:var(--text-primary)]">{item.value}</p>
                  </div>
                );
              })}
            </div>

            {spotlightMovie ? (
              <div className="rounded-[26px] border border-[color:var(--border-subtle)] bg-black/14 px-4 py-4 backdrop-blur-sm">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[color:var(--accent-soft)]">Spotlight</p>
                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="font-[family-name:var(--font-display)] text-3xl leading-none text-[color:var(--text-primary)]">
                      {spotlightMovie.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                      {(spotlightMovie.genres[0] ?? "Featured release")}
                      {spotlightMovie.releaseDate ? ` • ${spotlightMovie.releaseDate}` : ""}
                    </p>
                  </div>
                  <Link href={`/movies/${spotlightMovie.id}`} className="text-sm text-[color:var(--accent-soft)] transition hover:text-[color:var(--text-primary)]">
                    Open film
                  </Link>
                </div>
              </div>
            ) : null}
          </div>

          {posterShowcase.length ? (
            <div className="relative hidden min-h-[420px] xl:block">
              {posterShowcase.map((movie, index) => (
                <div
                  key={movie.id}
                  className={`absolute overflow-hidden rounded-[30px] border border-[rgba(255,255,255,0.12)] bg-black/40 shadow-[0_28px_80px_rgba(0,0,0,0.36)] ${showcasePositions[index] ?? showcasePositions[0]}`}
                >
                  <Image
                    src={movie.posterUrl ?? ""}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1280px) 40vw, 240px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute inset-x-4 bottom-4">
                    <p className="font-[family-name:var(--font-display)] text-[1.8rem] leading-none text-white">{movie.title}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/70">{movie.genres.slice(0, 2).join(" • ") || "Featured"}</p>
                  </div>
                </div>
              ))}

              <div className="absolute bottom-4 left-6 z-30 w-[280px] rounded-[28px] border border-[rgba(255,255,255,0.1)] bg-black/46 p-5 backdrop-blur-xl">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[color:var(--accent-soft)]">Freshest release</p>
                <p className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-none text-white">{spotlightMovie?.title}</p>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Use the home surface as a fast handoff from discovery to booking without losing the atmosphere of the film itself.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading
          eyebrow="Fresh from the catalog"
          title="Trending movies"
          actionHref="/movies"
          actionLabel="See all"
          description="A tighter selection of recent and upcoming titles with poster-first scanning."
        />
        {trendingMovies.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {trendingMovies.slice(0, 6).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-sm text-[color:var(--text-muted)]">No movie catalog entries are available right now.</p>
          </Card>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeading
          eyebrow="Places to go"
          title="Popular cinemas"
          actionHref="/cinemas"
          actionLabel="Browse cinemas"
          description="Venue cards stay practical, but the section framing is calmer and easier to scan."
        />
        {popularCinemas.length ? (
          <div className="grid gap-4 lg:grid-cols-2">{popularCinemas.slice(0, 4).map((cinema) => <CinemaCard key={cinema.id} cinema={cinema} />)}</div>
        ) : (
          <Card>
            <p className="text-sm text-[color:var(--text-muted)]">Cinema venue data is temporarily unavailable.</p>
          </Card>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[color:var(--accent-soft)]">Time first</p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-[2.35rem] leading-none text-[color:var(--text-primary)]">
                Upcoming showtimes
              </h3>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[color:var(--text-muted)]">
              A simpler list for what can still happen tonight, without dashboard clutter.
            </p>
          </div>
          <div className="mt-6 space-y-3">
            {upcomingRows.length ? (
              upcomingRows.slice(0, 6).map((row) => (
                <div
                  key={row.showtime.id}
                  className="flex items-center justify-between gap-4 rounded-[24px] border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)]/72 px-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[color:var(--text-primary)]">{row.movie.title}</p>
                    <p className="truncate text-xs uppercase tracking-[0.14em] text-[color:var(--text-muted)]">{row.cinema.name}</p>
                  </div>
                  <p className="shrink-0 text-sm text-[color:var(--accent-soft)]">{format(row.showtime.startsAt, "EEE HH:mm")}</p>
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-[color:var(--text-muted)]">
                No showtimes are scheduled yet. Check again after the next sync or browse the movie catalog instead.
              </p>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[color:var(--accent-soft)]">Personal layer</p>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-[2.35rem] leading-none text-[color:var(--text-primary)]">
              For you
            </h3>
          </div>
          {user ? (
            recommendations.length ? (
              recommendations.map((item, index) => (
                <RecommendationCard key={item.showtime.id} recommendation={item} highlight={index === 0} />
              ))
            ) : (
              <Card>
                <p className="text-sm text-[color:var(--text-muted)]">Rate a few movies to unlock sharper recommendations.</p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  <Link href="/movies" className="text-[color:var(--accent-soft)]">
                    Browse movies
                  </Link>
                  <Link href="/settings" className="text-[color:var(--accent-soft)]">
                    Update settings
                  </Link>
                </div>
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

      {user && dashboard?.upcomingWatchlistShowtimes.length ? (
        <section className="space-y-4">
          <SectionHeading
            eyebrow="Keep moving"
            title="Continue tonight"
            actionHref="/dashboard"
            actionLabel="Open dashboard"
            description="Showtimes tied directly to films already saved to your watchlist."
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {dashboard.upcomingWatchlistShowtimes.slice(0, 3).map((item) => (
              <Card key={item.showtime.id}>
                <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
                  {format(item.showtime.startsAt, "EEE, dd MMM - HH:mm")}
                </p>
                <p className="mt-2 text-xl text-[color:var(--text-primary)]">{item.movie.title}</p>
                <p className="mt-1 text-sm text-[color:var(--text-secondary)]">{item.cinema.name}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <Link href={`/movies/${item.movie.id}`} className="text-[color:var(--accent-soft)]">
                    Open movie
                  </Link>
                  <Link href={`/cinemas/${item.cinema.id}`} className="text-[color:var(--accent-soft)]">
                    Open cinema
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
