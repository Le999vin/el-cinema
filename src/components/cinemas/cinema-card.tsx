import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { CinemaSummary } from "@/domain/types";

export const CinemaCard = ({ cinema }: { cinema: CinemaSummary }) => (
  <Card className="space-y-4">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="font-[family-name:var(--font-display)] text-2xl text-[color:var(--text-primary)]">{cinema.name}</h3>
        <p className="text-sm text-[color:var(--text-secondary)]">{cinema.address}</p>
      </div>
      <Badge>{cinema.district ?? cinema.city}</Badge>
    </div>

    <div className="flex items-center gap-4 text-sm text-[color:var(--text-muted)]">
      <span>{cinema.movieCount} movies</span>
      <span>{cinema.showtimeCount} showtimes</span>
    </div>

    <div className="flex items-center justify-between">
      {cinema.websiteUrl ? (
        <a href={cinema.websiteUrl} target="_blank" rel="noreferrer" className="text-sm text-[color:var(--accent-soft)]">
          Website
        </a>
      ) : (
        <span className="text-sm text-[color:var(--text-muted)]">No website listed</span>
      )}
      <Link href={`/cinemas/${cinema.id}`} className="text-sm text-[color:var(--accent-soft)]">
        Details
      </Link>
    </div>
  </Card>
);

