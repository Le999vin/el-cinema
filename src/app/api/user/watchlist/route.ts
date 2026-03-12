import { watchlistInputSchema } from "@/domain/schemas";
import { loadMoviesCatalog } from "@/features/catalog/load-catalog";
import { jsonError, jsonOk } from "@/lib/http";
import { requireApiUser } from "@/services/auth/api-guards";
import {
  addWatchlistMovie,
  listWatchlistMovieIds,
  removeWatchlistMovie,
} from "@/services/db/repositories/user-repository";

export async function GET() {
  const auth = await requireApiUser();
  if ("status" in auth) {
    return auth;
  }

  const [watchlistIds, movies] = await Promise.all([listWatchlistMovieIds(auth.id), loadMoviesCatalog()]);
  const items = movies.filter((movie) => watchlistIds.includes(movie.id));

  return jsonOk({ items });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("status" in auth) {
    return auth;
  }

  try {
    const payload = watchlistInputSchema.parse(await request.json());
    await addWatchlistMovie(auth.id, payload.movieId);
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid watchlist payload.", 400);
  }
}

export async function DELETE(request: Request) {
  const auth = await requireApiUser();
  if ("status" in auth) {
    return auth;
  }

  try {
    const payload = watchlistInputSchema.parse(await request.json());
    await removeWatchlistMovie(auth.id, payload.movieId);
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid watchlist payload.", 400);
  }
}

