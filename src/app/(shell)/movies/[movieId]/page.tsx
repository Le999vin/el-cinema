import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MovieActions } from "@/components/movies/movie-actions";
import { RatingForm } from "@/components/movies/rating-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getMovieDetails } from "@/features/movies/get-movies";
import { getRecommendationsForUser } from "@/features/recommendations/get-recommendations";
import { hasDatabase } from "@/lib/env";
import { resolvePageRouteParams, type PageRouteParamsInput } from "@/lib/page-route-params";
import { resolveCurrentUser } from "@/services/auth/auth-service";
import { getUserProfile } from "@/services/db/repositories/user-repository";

export default async function MovieDetailPage({ params }: { params: PageRouteParamsInput<{ movieId: string }> }) {
  const { movieId } = await resolvePageRouteParams(params);
  const user = await resolveCurrentUser();
  const profile = user && hasDatabase ? await getUserProfile(user.id) : null;

  const details = await getMovieDetails(movieId, {
    watchlistMovieIds: profile?.watchlistMovieIds,
    seenMovieIds: profile?.seenMovieIds,
    ratings: profile?.ratings,
  });

  if (!details) {
    notFound();
  }

  const recommendationMatch = user
    ? (await getRecommendationsForUser(user.id, 8)).find((item) => item.movie.id === details.id)
    : null;

  const cinemaById = new Map(details.cinemas.map((cinema) => [cinema.id, cinema]));
  const groupedShowtimes = Object.entries(
    details.showtimes.reduce<Record<string, typeof details.showtimes>>((acc, showtime) => {
      const key = format(showtime.startsAt, "EEEE, dd MMMM");
      const current = acc[key] ?? [];

      return {
        ...acc,
        [key]: [...current, showtime],
      };
    }, {}),
  );

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden p-0">
        {details.backdropUrl ? (
          <>
            <div className="absolute inset-0">
              <Image src={details.backdropUrl} alt={details.title} fill className="object-cover opacity-30" sizes="100vw" />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(12,11,12,0.92),_rgba(12,11,12,0.68),_rgba(12,11,12,0.94))]" />
          </>
        ) : null}

        <div className="relative grid gap-6 p-6 lg:grid-cols-[300px_1fr] lg:p-8">
          <div className="relative h-[380px] w-full overflow-hidden rounded-3xl bg-[color:var(--panel-soft)]">
            {details.posterUrl ? (
              <Image src={details.posterUrl} alt={details.title} fill className="object-cover" sizes="300px" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[color:var(--text-muted)]">Poster unavailable</div>
            )}
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {details.genres.map((genre) => (
                  <Badge key={genre}>{genre}</Badge>
                ))}
                {details.runtimeMinutes ? <Badge>{details.runtimeMinutes} min</Badge> : null}
                {details.releaseDate ? <Badge>{details.releaseDate}</Badge> : null}
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--text-primary)]">{details.title}</h2>
                <p className="mt-3 max-w-3xl text-[color:var(--text-secondary)]">{details.overview}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-black/15 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">Cinemas</p>
                <p className="mt-2 text-2xl font-semibold">{details.cinemas.length}</p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-black/15 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">Upcoming showtimes</p>
                <p className="mt-2 text-2xl font-semibold">{details.showtimes.length}</p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-black/15 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">Your rating</p>
                <p className="mt-2 text-2xl font-semibold">{details.userRating?.overall.toFixed(1) ?? "-"}</p>
              </div>
            </div>

            {user ? (
              <MovieActions movieId={details.id} initialWatchlist={Boolean(details.onWatchlist)} initialSeen={Boolean(details.seen)} />
            ) : (
              <Link href="/login" className="text-sm text-[color:var(--accent-soft)]">
                Sign in to save, track, or rate this movie
              </Link>
            )}
          </div>
        </div>
      </Card>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-[family-name:var(--font-display)] text-3xl">Cinemas Showing This Movie</h3>
          <div className="mt-4 space-y-3">
            {details.cinemas.length ? (
              details.cinemas.map((cinema) => (
                <Link
                  key={cinema.id}
                  href={`/cinemas/${cinema.id}`}
                  className="block rounded-2xl border border-[color:var(--border-subtle)] px-4 py-3 hover:border-[color:var(--accent-soft)]"
                >
                  <p className="text-[color:var(--text-primary)]">{cinema.name}</p>
                  <p className="mt-1 text-xs text-[color:var(--text-muted)]">{cinema.address}</p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-[color:var(--text-muted)]">
                No cinemas are currently linked to this film. Browse the wider movie catalog while showtimes are being updated.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-[family-name:var(--font-display)] text-3xl">Showtimes by Day</h3>
          <div className="mt-4 space-y-4">
            {groupedShowtimes.length ? (
              groupedShowtimes.map(([day, showtimes]) => (
                <div key={day} className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">{day}</p>
                  <div className="space-y-3">
                    {showtimes.map((showtime) => (
                      <div
                        key={showtime.id}
                        className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-4 py-3 text-sm text-[color:var(--text-secondary)]"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-[color:var(--text-primary)]">
                              {cinemaById.get(showtime.cinemaId)?.name ?? "Cinema"}
                            </p>
                            <p className="mt-1">
                              {showtime.language}
                              {showtime.subtitleLanguage ? ` • ${showtime.subtitleLanguage} subs` : ""}
                              {showtime.room ? ` • ${showtime.room}` : ""}
                            </p>
                          </div>
                          <p className="text-[color:var(--accent-soft)]">{format(showtime.startsAt, "HH:mm")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[color:var(--text-muted)]">
                No showtimes are currently scheduled for this title. Check back after the next catalog sync.
              </p>
            )}
          </div>
        </Card>
      </section>

      {user ? <RatingForm movieId={details.id} initial={details.userRating ?? null} /> : null}

      {recommendationMatch ? (
        <Card>
          <h3 className="font-[family-name:var(--font-display)] text-3xl">Why Recommended</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {recommendationMatch.reasons.map((reason) => (
              <div
                key={reason.kind}
                className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-4 py-3 text-sm text-[color:var(--text-secondary)]"
              >
                {reason.message}
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
};
