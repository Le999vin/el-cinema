import Link from "next/link";
import { Bookmark, Clock, MapPin, Star, Tag } from "lucide-react";

import { DashboardStatsGrid } from "@/components/dashboard/dashboard-stats-grid";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-5xl">{user.displayName}</h2>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">Your watchlist, ratings, and preference signals at a glance.</p>
          </div>
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[color:var(--panel-soft)] font-[family-name:var(--font-display)] text-3xl text-[color:var(--accent)]">
            {user.displayName.slice(0, 1).toUpperCase()}
          </div>
        </div>
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
            {!dashboard.watchlist.length && (
              <EmptyState icon={Bookmark} title="Nothing added yet" />
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-[family-name:var(--font-display)] text-3xl">Taste Profile</h3>
          <div className="mt-4 space-y-3 text-sm text-[color:var(--text-secondary)]">
            <div className="flex items-start gap-2">
              <Tag size={14} className="mt-0.5 shrink-0 text-[color:var(--text-muted)]" />
              {(profile?.preferences.favouriteGenres ?? []).length ? (
                <span>Favourite genres: {(profile?.preferences.favouriteGenres ?? []).join(", ")}</span>
              ) : (
                <span>No explicit genre preferences saved yet.</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="shrink-0 text-[color:var(--text-muted)]" />
              <span>
                Preferred time window: {profile?.preferences.preferredTimeStart ?? "?"}:00 – {profile?.preferences.preferredTimeEnd ?? "?"}:00
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="shrink-0 text-[color:var(--text-muted)]" />
              <span>Favourite cinemas: {dashboard.stats.favouriteCinemaCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={14} className="shrink-0 text-[color:var(--text-muted)]" />
              <span>Average overall rating: {dashboard.stats.averageOverallRating?.toFixed(2) ?? "–"}</span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
