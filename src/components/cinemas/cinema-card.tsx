import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CinemaSummary } from "@/domain/types";
import { cn } from "@/lib/utils";

export const CinemaCard = ({
  cinema,
  selected = false,
  onSelect,
}: {
  cinema: CinemaSummary;
  selected?: boolean;
  onSelect?: () => void;
}) => (
  <Card className={cn("space-y-5", selected && "border-[color:var(--accent)] bg-[color:var(--panel-soft)]")}>
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{cinema.district ?? cinema.city}</Badge>
          <Badge>{cinema.region}</Badge>
          {cinema.rating != null ? <Badge>{cinema.rating.toFixed(1)} / 5</Badge> : null}
        </div>
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-2xl text-[color:var(--text-primary)]">{cinema.name}</h3>
          <p className="mt-1 text-sm text-[color:var(--text-secondary)]">{cinema.address}</p>
        </div>
      </div>
      <p className="max-w-[9rem] text-right text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
        {cinema.showtimeCount ? `${cinema.showtimeCount} showtimes live` : "Venue profile"}
      </p>
    </div>

    <div className="grid gap-2 text-sm text-[color:var(--text-muted)] sm:grid-cols-2">
      <p>{cinema.movieCount} movies currently indexed</p>
      <p>{cinema.showtimeCount} showtimes available to browse</p>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {cinema.websiteUrl ? (
          <a href={cinema.websiteUrl} target="_blank" rel="noreferrer" className="text-sm text-[color:var(--accent-soft)]">
            Website
          </a>
        ) : (
          <span className="text-sm text-[color:var(--text-muted)]">No website listed</span>
        )}
        {onSelect ? (
          <Button type="button" variant={selected ? "primary" : "secondary"} onClick={onSelect}>
            {selected ? "Focused on map" : "Focus on map"}
          </Button>
        ) : null}
      </div>
      <Link href={`/cinemas/${cinema.id}`} className="text-sm text-[color:var(--accent-soft)]">
        View venue
      </Link>
    </div>
  </Card>
);
