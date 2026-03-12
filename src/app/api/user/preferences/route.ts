import { preferenceInputSchema } from "@/domain/schemas";
import { jsonError, jsonOk } from "@/lib/http";
import { requireApiUser } from "@/services/auth/api-guards";
import {
  getUserPreferences,
  upsertUserPreferences,
} from "@/services/db/repositories/user-repository";

export async function GET() {
  const auth = await requireApiUser();
  if ("status" in auth) {
    return auth;
  }

  const preferences = await getUserPreferences(auth.id);
  return jsonOk({ preferences });
}

export async function PATCH(request: Request) {
  const auth = await requireApiUser();
  if ("status" in auth) {
    return auth;
  }

  try {
    const payload = preferenceInputSchema.parse(await request.json());
    const preferences = await upsertUserPreferences(auth.id, payload);
    return jsonOk({ preferences });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid preferences payload.", 400);
  }
}

