import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";

import { FavouriteCinemaToggle } from "@/components/cinemas/favourite-cinema-toggle";
import { CinemaMapShell } from "@/components/map/cinema-map-shell";
import { RecommendationCard } from "@/components/recommendations/recommendation-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCinemaDetails } from "@/features/cinemas/get-cinemas";
import { getRecommendationsForUser } from "@/features/recommendations/get-recommendations";
import { hasDatabase } from "@/lib/env";
import { resolvePageRouteParams, type PageRouteParamsInput } from "@/lib/page-route-params";
import { resolveCurrentUser } from "@/services/auth/auth-service";
import { listFavouriteCinemaIds } from "@/services/db/repositories/user-repository";

export default async function CinemaDetailPage({ params }: { params: PageRouteParamsInput<{ cinemaId: string }> }) {
  const { cinemaId } = await resolvePageRouteParams(params);
  const user = await resolveCurrentUser();

  const favouriteIds = user && hasDatabase ? await listFavouriteCinemaIds(user.id) : [];
  const details = await getCinemaDetails(cinemaId, favouriteIds);

  if (!details) {
    notFound();
  }

  const recommendations = user ? await getRecommendationsForUser(user.id, 5) : [];
  const relatedRecommendations = recommendations.filter((item) => item.cinema.id === details.id).slice(0, 2);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--text-primary)]">{details.name}</h2>
            <p className="mt-2 text-[color:var(--text-secondary)]">{details.address}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{details.city}</Badge>
              <Badge>{details.region}</Badge>
              {details.district ? <Badge>{details.district}</Badge> : null}
              {details.rating != null ? <Badge>{details.rating.toFixed(1)} / 5</Badge> : null}
              {details.types.slice(0, 2).map((type) => <Badge key={type}>{type.replaceAll("_", " ")}</Badge>)}
            </div>
          </div>

          {user ? (
            <FavouriteCinemaToggle cinemaId={details.id} initialFavourite={details.isFavourite ?? false} />
          ) : (
            <Link href="/login" className="text-sm text-[color:var(--accent-soft)]">
              Sign in to save favourite
            </Link>
          )}
        </div>

        <div className="mt-5 grid gap-4 text-sm text-[color:var(--text-muted)] md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.08em]">Website</p>
            {details.websiteUrl ? (
              <a href={details.websiteUrl} target="_blank" rel="noreferrer" className="text-[color:var(--accent-soft)]">
                {details.websiteUrl}
              </a>
            ) : (
              <p>-</p>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.08em]">Phone</p>
            <p>{details.phoneNumber ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.08em]">Maps</p>
            {details.googleMapsUri ? (
              <a href={details.googleMapsUri} target="_blank" rel="noreferrer" className="text-[color:var(--accent-soft)]">
                Open in Google Maps
              </a>
            ) : (
              <p>-</p>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.08em]">Place Types</p>
            <p>{details.types.length ? details.types.slice(0, 4).map((type) => type.replaceAll("_", " ")).join(" • ") : "-"}</p>
          </div>
        </div>

        {details.editorialSummary ? (
          <div className="mt-5 rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-4 py-3 text-sm text-[color:var(--text-secondary)]">
            {details.editorialSummary}
          </div>
        ) : null}

        {details.openingHours?.length ? (
          <div className="mt-5">
            <p className="text-xs uppercase tracking-[0.08em] text-[color:var(--text-muted)]">Opening Hours</p>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {details.openingHours.map((entry) => (
                <div
                  key={entry}
                  className="rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-3 py-2 text-sm text-[color:var(--text-secondary)]"
                >
                  {entry}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Card>

      <Card>
        <h3 className="mb-4 font-[family-name:var(--font-display)] text-3xl">Location</h3>
        <CinemaMapShell cinemas={[details]} height={280} />
      </Card>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-[family-name:var(--font-display)] text-3xl">Movies Showing Here</h3>
          <div className="mt-4 space-y-3">
            {details.movies.map((movie) => (
              <Link key={movie.id} href={`/movies/${movie.id}`} className="block rounded-xl border border-[color:var(--border-subtle)] px-4 py-3 hover:border-[color:var(--accent-soft)]">
                <p className="text-[color:var(--text-primary)]">{movie.title}</p>
                <p className="text-xs text-[color:var(--text-muted)]">{movie.genres.slice(0, 3).join(" • ")}</p>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-[family-name:var(--font-display)] text-3xl">Upcoming Showtimes</h3>
          <div className="mt-4 space-y-3">
            {details.showtimes.slice(0, 10).map((showtime) => (
              <div key={showtime.id} className="rounded-xl border border-[color:var(--border-subtle)] px-4 py-3 text-sm text-[color:var(--text-secondary)]">
                <p className="text-[color:var(--text-primary)]">{format(showtime.startsAt, "EEEE, dd MMM - HH:mm")}</p>
                <p>
                  {showtime.language}
                  {showtime.subtitleLanguage ? ` • subs ${showtime.subtitleLanguage}` : ""}
                  {showtime.room ? ` • ${showtime.room}` : ""}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {relatedRecommendations.length ? (
        <section className="space-y-3">
          <h3 className="font-[family-name:var(--font-display)] text-3xl">Related Recommendations</h3>
          <div className="grid gap-4 lg:grid-cols-2">
            {relatedRecommendations.map((recommendation) => (
              <RecommendationCard key={recommendation.showtime.id} recommendation={recommendation} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
