import { format } from "date-fns";

import { Card } from "@/components/ui/card";
import type { RecommendationResult } from "@/domain/types";

export const RecommendationCard = ({ recommendation, highlight = false }: { recommendation: RecommendationResult; highlight?: boolean }) => (
  <Card className={highlight ? "border-[color:var(--accent)] bg-[linear-gradient(160deg,_rgba(212,162,75,0.2),_rgba(19,17,16,0.95))]" : undefined}>
    <div className="space-y-3">
      <div>
        <p className="text-xs uppercase tracking-[0.1em] text-[color:var(--accent-soft)]">Score {recommendation.score.toFixed(2)}</p>
        <h3 className="font-[family-name:var(--font-display)] text-3xl text-[color:var(--text-primary)]">{recommendation.movie.title}</h3>
      </div>
      <p className="text-sm text-[color:var(--text-secondary)]">
        {recommendation.cinema.name} • {format(recommendation.showtime.startsAt, "EEEE, dd MMM - HH:mm")}
      </p>
      <ul className="space-y-1 text-sm text-[color:var(--text-muted)]">
        {recommendation.reasons.map((reason) => (
          <li key={reason.kind}>• {reason.message}</li>
        ))}
      </ul>
    </div>
  </Card>
);

