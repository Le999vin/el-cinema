import { z } from "zod";

import { showtimeInputSchema } from "@/domain/schemas";
import { jsonError, jsonOk } from "@/lib/http";
import { requireApiAdmin } from "@/services/auth/api-guards";
import {
  createShowtime,
  deleteShowtime,
  listShowtimes,
  updateShowtime,
} from "@/services/db/repositories/showtime-repository";

const updateSchema = showtimeInputSchema.partial().extend({
  id: z.string().uuid(),
});

const deleteSchema = z.object({
  id: z.string().uuid(),
});

export async function GET() {
  const auth = await requireApiAdmin();
  if ("status" in auth) {
    return auth;
  }

  const showtimes = await listShowtimes();
  return jsonOk({ showtimes });
}

export async function POST(request: Request) {
  const auth = await requireApiAdmin();
  if ("status" in auth) {
    return auth;
  }

  try {
    const payload = showtimeInputSchema.parse(await request.json());
    const showtime = await createShowtime(payload);
    return jsonOk({ showtime });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid showtime payload.", 400);
  }
}

export async function PATCH(request: Request) {
  const auth = await requireApiAdmin();
  if ("status" in auth) {
    return auth;
  }

  try {
    const payload = updateSchema.parse(await request.json());
    const showtime = await updateShowtime(payload.id, payload);

    if (!showtime) {
      return jsonError("Showtime not found.", 404);
    }

    return jsonOk({ showtime });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid showtime update payload.", 400);
  }
}

export async function DELETE(request: Request) {
  const auth = await requireApiAdmin();
  if ("status" in auth) {
    return auth;
  }

  try {
    const payload = deleteSchema.parse(await request.json());
    const ok = await deleteShowtime(payload.id);
    return jsonOk({ ok });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid showtime delete payload.", 400);
  }
}

