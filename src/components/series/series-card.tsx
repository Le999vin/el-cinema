import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { SeriesSummary } from "@/domain/types";

export const SeriesCard = ({ series }: { series: SeriesSummary }) => (
  <Card className="overflow-hidden p-0">
    <div className="relative h-72 w-full bg-[color:var(--panel-soft)]">
      {series.posterUrl ? (
        <Image src={series.posterUrl} alt={series.name} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-[color:var(--text-muted)]">Poster unavailable</div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-2xl leading-tight text-white">{series.name}</h3>
          <p className="text-xs text-zinc-300">{series.firstAirDate ?? "TBA"}</p>
        </div>
        <Link href={`/series/${series.id}`} className="text-xs text-[color:var(--accent-soft)]">
          Open
        </Link>
      </div>
    </div>

    <div className="flex flex-wrap gap-2 p-4">
      {series.genres.slice(0, 3).map((genre) => (
        <Badge key={genre}>{genre}</Badge>
      ))}
    </div>
  </Card>
);
