import { favouriteCinemaInputSchema } from "@/domain/schemas";
import { loadCinemasCatalog } from "@/features/catalog/load-catalog";
import { jsonError, jsonOk } from "@/lib/http";
import { requireApiUser } from "@/services/auth/api-guards";
import {
  addFavouriteCinema,
  listFavouriteCinemaIds,
  removeFavouriteCinema,
} from "@/services/db/repositories/user-repository";

export async function GET() {
  const auth = await requireApiUser();
  if ("status" in auth) {
    return auth;
  }

  const [favouriteIds, cinemas] = await Promise.all([listFavouriteCinemaIds(auth.id), loadCinemasCatalog()]);
  const items = cinemas.filter((cinema) => favouriteIds.includes(cinema.id));

  return jsonOk({ items });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("status" in auth) {
    return auth;
  }

  try {
    const payload = favouriteCinemaInputSchema.parse(await request.json());
    await addFavouriteCinema(auth.id, payload.cinemaId);
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid favourite payload.", 400);
  }
}

export async function DELETE(request: Request) {
  const auth = await requireApiUser();
  if ("status" in auth) {
    return auth;
  }

  try {
    const payload = favouriteCinemaInputSchema.parse(await request.json());
    await removeFavouriteCinema(auth.id, payload.cinemaId);
    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid favourite payload.", 400);
  }
}

