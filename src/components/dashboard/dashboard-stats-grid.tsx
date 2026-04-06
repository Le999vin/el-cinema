import { Bookmark, Calendar, Eye, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { DashboardStats } from "@/domain/types";

const StatCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
}) => (
  <Card className="flex items-start justify-between">
    <div>
      <p className="text-xs uppercase tracking-[0.1em] text-[color:var(--text-muted)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-[color:var(--text-primary)]">{value}</p>
    </div>
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--panel-soft)] text-[color:var(--accent-soft)]">
      <Icon size={20} />
    </div>
  </Card>
);

export const DashboardStatsGrid = ({ stats }: { stats: DashboardStats }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <StatCard label="Watchlist" value={stats.watchlistCount} icon={Bookmark} />
    <StatCard label="Seen Movies" value={stats.seenCount} icon={Eye} />
    <StatCard label="Ratings" value={stats.ratingsCount} icon={Star} />
    <StatCard label="Upcoming Picks" value={stats.totalUpcomingShowtimes} icon={Calendar} />
  </div>
);
