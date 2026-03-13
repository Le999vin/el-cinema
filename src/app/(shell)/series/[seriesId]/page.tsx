import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getSeriesDetails } from "@/features/series/get-series";
import { resolvePageRouteParams, type PageRouteParamsInput } from "@/lib/page-route-params";

export default async function SeriesDetailPage({ params }: { params: PageRouteParamsInput<{ seriesId: string }> }) {
  const { seriesId } = await resolvePageRouteParams(params);
  const details = await getSeriesDetails(seriesId);

  if (!details) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="grid lg:grid-cols-[280px_1fr]">
          <div className="relative h-[380px] w-full bg-[color:var(--panel-soft)]">
            {details.posterUrl ? (
              <Image src={details.posterUrl} alt={details.name} fill className="object-cover" sizes="280px" />
            ) : null}
          </div>

          <div className="space-y-5 p-6">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--text-primary)]">{details.name}</h2>
              <p className="mt-3 max-w-3xl text-[color:var(--text-secondary)]">{details.overview}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {details.genres.map((genre) => (
                <Badge key={genre}>{genre}</Badge>
              ))}
              {details.episodeRuntimeMinutes ? <Badge>{details.episodeRuntimeMinutes} min / ep</Badge> : null}
              {details.firstAirDate ? <Badge>{details.firstAirDate}</Badge> : null}
              {details.numberOfSeasons ? <Badge>{details.numberOfSeasons} seasons</Badge> : null}
              {details.numberOfEpisodes ? <Badge>{details.numberOfEpisodes} episodes</Badge> : null}
            </div>

            <p className="text-sm text-[color:var(--text-muted)]">
              Series are catalog-only in this phase. Movie-specific watchlists, ratings, and Zurich showtimes remain unchanged.
            </p>
          </div>
        </div>
      </Card>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <h3 className="font-[family-name:var(--font-display)] text-3xl">Series Overview</h3>
          <div className="mt-4 space-y-3 text-sm text-[color:var(--text-secondary)]">
            <p>{details.overview}</p>
            {details.voteAverage != null ? <p>TMDb rating: {details.voteAverage.toFixed(1)}</p> : null}
          </div>
        </Card>

        <Card>
          <h3 className="font-[family-name:var(--font-display)] text-3xl">Continue Browsing</h3>
          <div className="mt-4 space-y-3 text-sm">
            <Link href="/series" className="block text-[color:var(--accent-soft)]">
              Back to series catalog
            </Link>
            <Link href="/movies" className="block text-[color:var(--accent-soft)]">
              Browse movies
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
