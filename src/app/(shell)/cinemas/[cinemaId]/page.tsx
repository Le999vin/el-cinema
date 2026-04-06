import { format } from "date-fns";
import Link from "next/link";
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
      <Card className="bg-[linear-gradient(135deg,_rgba(212,162,75,0.16),_rgba(17,16,16,0.95))]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge>{details.city}</Badge>
              <Badge>{details.region}</Badge>
              {details.district ? <Badge>{details.district}</Badge> : null}
              {details.rating != null ? <Badge>{details.rating.toFixed(1)} / 5</Badge> : null}
              {details.types.slice(0, 2).map((type) => <Badge key={type}>{type.replaceAll("_", " ")}</Badge>)}
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--text-primary)]">{details.name}</h2>
            <p className="mt-2 text-[color:var(--text-secondary)]">{details.address}</p>
            {details.editorialSummary ? (
              <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-secondary)]">{details.editorialSummary}</p>
            ) : null}
          </div>

          {user ? (
            <FavouriteCinemaToggle cinemaId={details.id} initialFavourite={details.isFavourite ?? false} />
          ) : (
            <Link href="/login" className="text-sm text-[color:var(--accent-soft)]">
              Sign in to save favourite
            </Link>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-black/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">Website</p>
            {details.websiteUrl ? (
              <a href={details.websiteUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm text-[color:var(--accent-soft)]">
                Visit website
              </a>
            ) : (
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">No website listed</p>
            )}
          </div>
          <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-black/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">Maps</p>
            {details.googleMapsUri ? (
              <a href={details.googleMapsUri} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm text-[color:var(--accent-soft)]">
                Open in Google Maps
              </a>
            ) : (
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">No map link available</p>
            )}
          </div>
          <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-black/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">Phone</p>
            <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{details.phoneNumber ?? "No phone number listed"}</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-[family-name:var(--font-display)] text-3xl">Location</h3>
            <p className="text-sm text-[color:var(--text-muted)]">Use the map to orient the venue before picking a screening.</p>
          </div>
          {details.googleMapsUri ? (
            <a href={details.googleMapsUri} target="_blank" rel="noreferrer" className="text-sm text-[color:var(--accent-soft)]">
              Open directions
            </a>
          ) : null}
        </div>
        <CinemaMapShell cinemas={[details]} height={320} />
      </Card>

      {details.openingHours?.length ? (
        <Card>
          <h3 className="font-[family-name:var(--font-display)] text-3xl">Opening Hours</h3>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {details.openingHours.map((entry) => (
              <div
                key={entry}
                className="rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-3 py-2 text-sm text-[color:var(--text-secondary)]"
              >
                {entry}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-[family-name:var(--font-display)] text-3xl">Movies Showing Here</h3>
          <div className="mt-4 space-y-3">
            {details.movies.length ? (
              details.movies.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movies/${movie.id}`}
                  className="block rounded-2xl border border-[color:var(--border-subtle)] px-4 py-3 hover:border-[color:var(--accent-soft)]"
                >
                  <p className="text-[color:var(--text-primary)]">{movie.title}</p>
                  <p className="mt-1 text-xs text-[color:var(--text-muted)]">{movie.genres.slice(0, 3).join(" • ")}</p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-[color:var(--text-muted)]">
                No movies are currently linked to this venue. Browse the wider catalog while the next showtime batch is being prepared.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-[family-name:var(--font-display)] text-3xl">Upcoming Showtimes</h3>
          <div className="mt-4 space-y-3">
            {details.showtimes.length ? (
              details.showtimes.slice(0, 10).map((showtime) => (
                <div
                  key={showtime.id}
                  className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-4 py-3 text-sm text-[color:var(--text-secondary)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="text-[color:var(--text-primary)]">{format(showtime.startsAt, "EEEE, dd MMM - HH:mm")}</p>
                    <p className="text-[color:var(--accent-soft)]">{showtime.room ?? "Room TBA"}</p>
                  </div>
                  <p className="mt-1">
                    {showtime.language}
                    {showtime.subtitleLanguage ? ` • subs ${showtime.subtitleLanguage}` : ""}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[color:var(--text-muted)]">
                There are no upcoming showtimes at this venue yet. Check back after the next sync or browse other Zurich cinemas.
              </p>
            )}
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
