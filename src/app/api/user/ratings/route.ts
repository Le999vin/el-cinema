import { ratingInputSchema, watchlistInputSchema } from "@/domain/schemas";
import { jsonError, jsonOk } from "@/lib/http";
import { requireApiUser } from "@/services/auth/api-guards";
import {
  deleteUserRating,
  listUserRatings,
  upsertUserRating,
} from "@/services/db/repositories/user-repository";

export async function GET() {
  const auth = await requireApiUser();
  if ("status" in auth) {
    return auth;
  }

  const ratings = await listUserRatings(auth.id);
  return jsonOk({ ratings });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("status" in auth) {
    return auth;
  }

  try {
    const payload = ratingInputSchema.parse(await request.json());
    const rating = await upsertUserRating(auth.id, payload);
    return jsonOk({ rating });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid rating payload.", 400);
  }
}

export async function DELETE(request: Request) {
  const auth = await requireApiUser();
  if ("status" in auth) {
    return auth;
  }

  try {
    const payload = watchlistInputSchema.parse(await request.json());
    await deleteUserRating(auth.id, payload.movieId);
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid rating delete payload.", 400);
  }
}

