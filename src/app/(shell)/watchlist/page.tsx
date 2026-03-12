import Link from "next/link";

import { Card } from "@/components/ui/card";
import { loadMoviesCatalog } from "@/features/catalog/load-catalog";
import { hasDatabase } from "@/lib/env";
import { requireUser } from "@/services/auth/auth-service";
import { listWatchlistMovieIds } from "@/services/db/repositories/user-repository";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const user = await requireUser();

  const [watchlistIds, movies] = hasDatabase
    ? await Promise.all([listWatchlistMovieIds(user.id), loadMoviesCatalog()])
    : [[], []];

  const watchlist = movies.filter((movie) => watchlistIds.includes(movie.id));

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-[family-name:var(--font-display)] text-5xl">Watchlist</h2>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">Movies you marked to watch soon.</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {watchlist.map((movie) => (
          <Card key={movie.id}>
            <Link href={`/movies/${movie.id}`} className="text-xl text-[color:var(--text-primary)]">
              {movie.title}
            </Link>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">{movie.genres.join(" • ")}</p>
          </Card>
        ))}
      </div>

      {!watchlist.length ? (
        <Card>
          <p className="text-sm text-[color:var(--text-muted)]">No movies in watchlist yet.</p>
        </Card>
      ) : null}
    </div>
  );
}

