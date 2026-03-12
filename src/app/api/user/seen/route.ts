import { seenInputSchema } from "@/domain/schemas";
import { loadMoviesCatalog } from "@/features/catalog/load-catalog";
import { jsonError, jsonOk } from "@/lib/http";
import { requireApiUser } from "@/services/auth/api-guards";
import { listSeenMovieIds, setSeenMovie } from "@/services/db/repositories/user-repository";

export async function GET() {
  const auth = await requireApiUser();
  if ("status" in auth) {
    return auth;
  }

  const [seenMovieIds, movies] = await Promise.all([listSeenMovieIds(auth.id), loadMoviesCatalog()]);
  const items = movies.filter((movie) => seenMovieIds.includes(movie.id));

  return jsonOk({ items });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("status" in auth) {
    return auth;
  }

  try {
    const payload = seenInputSchema.parse(await request.json());
    await setSeenMovie(auth.id, payload.movieId, payload.seen);
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid seen payload.", 400);
  }
}

