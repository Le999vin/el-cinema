import Link from "next/link";
import { format } from "date-fns";
import { Bookmark, Clock, MapPin, Sparkles, Star, Tag } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { RecommendationReason, RecommendationResult } from "@/domain/types";

const REASON_ICONS: Record<RecommendationReason["kind"], LucideIcon> = {
  genre: Tag,
  "rating-history": Star,
  cinema: MapPin,
  "time-window": Clock,
  watchlist: Bookmark,
  freshness: Sparkles,
};

export const RecommendationCard = ({
  recommendation,
  highlight = false,
}: {
  recommendation: RecommendationResult;
  highlight?: boolean;
}) => {
  const scorePercent = Math.round(recommendation.score * 100);

  return (
    <Card className={highlight ? "border-[color:var(--accent)] bg-[linear-gradient(160deg,_rgba(212,162,75,0.2),_rgba(19,17,16,0.95))]" : undefined}>
      <div className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.1em] text-[color:var(--accent-soft)]">Match score</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-2xl font-semibold text-[color:var(--accent)]">
              {scorePercent}
              <span className="text-sm text-[color:var(--text-muted)]">%</span>
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[color:var(--panel-soft)]">
              <div
                className="h-full rounded-full bg-[color:var(--accent)]"
                style={{ width: `${Math.min(scorePercent, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div>
          <Link
            href={`/movies/${recommendation.movie.id}`}
            className="font-[family-name:var(--font-display)] text-3xl text-[color:var(--text-primary)] hover:text-[color:var(--accent-soft)]"
          >
            {recommendation.movie.title}
          </Link>
        </div>

        <p className="text-sm text-[color:var(--text-secondary)]">
          {recommendation.cinema.name} • {format(recommendation.showtime.startsAt, "EEEE, dd MMM - HH:mm")}
        </p>

        <ul className="space-y-1.5">
          {recommendation.reasons.map((reason) => {
            const Icon = REASON_ICONS[reason.kind];
            return (
              <li key={reason.kind} className="flex items-center gap-2 text-sm text-[color:var(--text-muted)]">
                <Icon size={13} className="shrink-0 text-[color:var(--accent-soft)]" />
                {reason.message}
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
};
