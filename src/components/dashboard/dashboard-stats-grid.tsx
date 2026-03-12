import { Card } from "@/components/ui/card";
import type { DashboardStats } from "@/domain/types";

export const DashboardStatsGrid = ({ stats }: { stats: DashboardStats }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <Card>
      <p className="text-xs uppercase tracking-[0.1em] text-[color:var(--text-muted)]">Watchlist</p>
      <p className="mt-2 text-3xl font-semibold text-[color:var(--text-primary)]">{stats.watchlistCount}</p>
    </Card>
    <Card>
      <p className="text-xs uppercase tracking-[0.1em] text-[color:var(--text-muted)]">Seen Movies</p>
      <p className="mt-2 text-3xl font-semibold text-[color:var(--text-primary)]">{stats.seenCount}</p>
    </Card>
    <Card>
      <p className="text-xs uppercase tracking-[0.1em] text-[color:var(--text-muted)]">Ratings</p>
      <p className="mt-2 text-3xl font-semibold text-[color:var(--text-primary)]">{stats.ratingsCount}</p>
    </Card>
    <Card>
      <p className="text-xs uppercase tracking-[0.1em] text-[color:var(--text-muted)]">Upcoming Picks</p>
      <p className="mt-2 text-3xl font-semibold text-[color:var(--text-primary)]">{stats.totalUpcomingShowtimes}</p>
    </Card>
  </div>
);

