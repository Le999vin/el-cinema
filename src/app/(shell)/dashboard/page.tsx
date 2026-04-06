import Link from "next/link";
import { format } from "date-fns";

import { DashboardStatsGrid } from "@/components/dashboard/dashboard-stats-grid";
import { Card } from "@/components/ui/card";
import { deriveTasteProfile } from "@/domain/logic/taste-profile";
import { getDashboardData } from "@/features/dashboard/get-dashboard-data";
import { hasDatabase } from "@/lib/env";
import { requireUser } from "@/services/auth/auth-service";
import { getUserProfile } from "@/services/db/repositories/user-repository";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();

  const [dashboard, profile] = await Promise.all([
    getDashboardData(user.id),
    hasDatabase ? getUserProfile(user.id) : null,
  ]);
  const tasteProfile = profile ? deriveTasteProfile(profile) : null;
  const topGenreSummary = dashboard.stats.topGenres.slice(0, 3).map((entry) => entry.genre).join(", ");

  return (
    <div className="space-y-6">
      <Card className="bg-[linear-gradient(135deg,_rgba(212,162,75,0.16),_rgba(17,16,16,0.96))]">
        <h2 className="font-[family-name:var(--font-display)] text-5xl">{user.displayName}</h2>
        <p className="mt-2 max-w-3xl text-sm text-[color:var(--text-muted)]">
          Your watchlist, ratings, favourite venues, and timing preferences in one operating view.
        </p>
      </Card>

      <DashboardStatsGrid stats={dashboard.stats} />

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="font-[family-name:var(--font-display)] text-3xl">Watchlist</h3>
            <Link href="/watchlist" className="text-sm text-[color:var(--accent-soft)]">Open full list</Link>
          </div>
          <div className="mt-4 space-y-3">
            {dashboard.watchlist.slice(0, 6).map((movie) => (
              <Link key={movie.id} href={`/movies/${movie.id}`} className="block rounded-xl border border-[color:var(--border-subtle)] px-4 py-3 hover:border-[color:var(--accent-soft)]">
                <p>{movie.title}</p>
                <p className="text-xs text-[color:var(--text-muted)]">{movie.genres.slice(0, 2).join(" • ")}</p>
              </Link>
            ))}
            {!dashboard.watchlist.length ? <p className="text-sm text-[color:var(--text-muted)]">Your watchlist is still empty.</p> : null}
          </div>
        </Card>

        <Card>
          <h3 className="font-[family-name:var(--font-display)] text-3xl">Taste Profile</h3>
          <div className="mt-4 space-y-2 text-sm text-[color:var(--text-secondary)]">
            {(profile?.preferences.favouriteGenres ?? []).length ? (
              <p>Favourite genres: {(profile?.preferences.favouriteGenres ?? []).join(", ")}</p>
            ) : (
              <p>No explicit genre preferences saved yet.</p>
            )}
            <p>Preferred time window: {profile?.preferences.preferredTimeStart ?? "?"}:00 - {profile?.preferences.preferredTimeEnd ?? "?"}:00</p>
            <p>Favourite cinemas: {dashboard.stats.favouriteCinemaCount}</p>
            <p>Average overall rating: {dashboard.stats.averageOverallRating?.toFixed(2) ?? "-"}</p>
            <p>
              Current profile read:{" "}
              {tasteProfile
                ? tasteProfile.prefersEvening
                  ? "you trend toward evening screenings and higher-intensity cinema nights."
                  : "you lean toward earlier sessions and a broader mix of tones."
                : "your preference model will sharpen as you add ratings."}
            </p>
            {topGenreSummary ? <p>Most represented genres from your ratings: {topGenreSummary}.</p> : null}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-[family-name:var(--font-display)] text-3xl">Upcoming Watchlist Showtimes</h3>
            <Link href="/showtimes" className="text-sm text-[color:var(--accent-soft)]">
              Browse showtimes
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {dashboard.upcomingWatchlistShowtimes.length ? (
              dashboard.upcomingWatchlistShowtimes.map((item) => (
                <div
                  key={item.showtime.id}
                  className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-4 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link href={`/movies/${item.movie.id}`} className="text-[color:var(--text-primary)]">
                        {item.movie.title}
                      </Link>
                      <p className="mt-1 text-sm text-[color:var(--text-muted)]">{item.cinema.name}</p>
                    </div>
                    <p className="text-sm text-[color:var(--accent-soft)]">
                      {format(item.showtime.startsAt, "EEE, dd MMM - HH:mm")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[color:var(--text-muted)]">
                Add a few films to your watchlist and they will surface here once matching showtimes are available.
              </p>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="font-[family-name:var(--font-display)] text-3xl">Recent Ratings</h3>
            <div className="mt-4 space-y-3">
              {dashboard.recentRatings.length ? (
                dashboard.recentRatings.map((entry) => (
                  <div key={entry.movie.id} className="rounded-2xl border border-[color:var(--border-subtle)] px-4 py-3">
                    <Link href={`/movies/${entry.movie.id}`} className="text-[color:var(--text-primary)]">
                      {entry.movie.title}
                    </Link>
                    <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                      Overall {entry.rating.overall.toFixed(1)} • Story {entry.rating.story.toFixed(1)} • Visuals {entry.rating.visuals.toFixed(1)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[color:var(--text-muted)]">Rate a few movies to reveal your strongest patterns.</p>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="font-[family-name:var(--font-display)] text-3xl">Favourite Cinemas</h3>
            <div className="mt-4 space-y-3">
              {dashboard.favouriteCinemas.length ? (
                dashboard.favouriteCinemas.map((cinema) => (
                  <Link
                    key={cinema.id}
                    href={`/cinemas/${cinema.id}`}
                    className="block rounded-2xl border border-[color:var(--border-subtle)] px-4 py-3 text-sm text-[color:var(--text-secondary)]"
                  >
                    <p className="text-[color:var(--text-primary)]">{cinema.name}</p>
                    <p className="mt-1">{cinema.address}</p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-[color:var(--text-muted)]">
                  Save the venues you trust most to give recommendations a stronger location signal.
                </p>
              )}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
