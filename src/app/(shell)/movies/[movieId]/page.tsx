import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";

import { MovieActions } from "@/components/movies/movie-actions";
import { RatingForm } from "@/components/movies/rating-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getMovieDetails } from "@/features/movies/get-movies";
import { getRecommendationsForUser } from "@/features/recommendations/get-recommendations";
import { hasDatabase } from "@/lib/env";
import { resolveCurrentUser } from "@/services/auth/auth-service";
import { getUserProfile } from "@/services/db/repositories/user-repository";

export default async function MovieDetailPage({ params }: { params: { movieId: string } }) {
  const user = await resolveCurrentUser();
  const profile = user && hasDatabase ? await getUserProfile(user.id) : null;

  const details = await getMovieDetails(params.movieId, {
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

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="grid lg:grid-cols-[280px_1fr]">
          <div className="relative h-[380px] w-full bg-[color:var(--panel-soft)]">
            {details.posterUrl ? (
              <Image src={details.posterUrl} alt={details.title} fill className="object-cover" sizes="280px" />
            ) : null}
          </div>

          <div className="space-y-5 p-6">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--text-primary)]">{details.title}</h2>
              <p className="mt-3 max-w-3xl text-[color:var(--text-secondary)]">{details.overview}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {details.genres.map((genre) => (
                <Badge key={genre}>{genre}</Badge>
              ))}
              {details.runtimeMinutes ? <Badge>{details.runtimeMinutes} min</Badge> : null}
              {details.releaseDate ? <Badge>{details.releaseDate}</Badge> : null}
            </div>

            {user ? (
              <MovieActions movieId={details.id} initialWatchlist={Boolean(details.onWatchlist)} initialSeen={Boolean(details.seen)} />
            ) : (
              <Link href="/login" className="text-sm text-[color:var(--accent-soft)]">
                Sign in to save or rate this movie
              </Link>
            )}
          </div>
        </div>
      </Card>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-[family-name:var(--font-display)] text-3xl">Cinemas Showing This Movie</h3>
          <div className="mt-4 space-y-3">
            {details.cinemas.map((cinema) => (
              <Link key={cinema.id} href={`/cinemas/${cinema.id}`} className="block rounded-xl border border-[color:var(--border-subtle)] px-4 py-3 hover:border-[color:var(--accent-soft)]">
                <p className="text-[color:var(--text-primary)]">{cinema.name}</p>
                <p className="text-xs text-[color:var(--text-muted)]">{cinema.address}</p>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-[family-name:var(--font-display)] text-3xl">Showtimes</h3>
          <div className="mt-4 space-y-3">
            {details.showtimes.slice(0, 12).map((showtime) => (
              <div key={showtime.id} className="rounded-xl border border-[color:var(--border-subtle)] px-4 py-3 text-sm text-[color:var(--text-secondary)]">
                <p className="text-[color:var(--text-primary)]">{format(showtime.startsAt, "EEE, dd MMM - HH:mm")}</p>
                <p>{showtime.language}{showtime.subtitleLanguage ? ` • ${showtime.subtitleLanguage} subs` : ""}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {user ? <RatingForm movieId={details.id} initial={details.userRating ?? null} /> : null}

      {recommendationMatch ? (
        <Card>
          <h3 className="font-[family-name:var(--font-display)] text-3xl">Why Recommended</h3>
          <ul className="mt-4 space-y-2 text-sm text-[color:var(--text-secondary)]">
            {recommendationMatch.reasons.map((reason) => (
              <li key={reason.kind}>• {reason.message}</li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}

