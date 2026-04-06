import { Bookmark } from "lucide-react";

import { MovieCard } from "@/components/movies/movie-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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
        <div className="flex items-baseline gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-5xl">Watchlist</h2>
          {watchlist.length > 0 && (
            <Badge>{watchlist.length} movie{watchlist.length !== 1 ? "s" : ""}</Badge>
          )}
        </div>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">Movies you marked to watch soon.</p>
      </Card>

      {watchlist.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {watchlist.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onWatchlist />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={Bookmark}
            title="Your watchlist is empty"
            description="Browse movies and add them to your watchlist"
          />
        </Card>
      )}
    </div>
  );
}
