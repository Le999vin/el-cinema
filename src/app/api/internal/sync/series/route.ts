import { jsonError, jsonOk } from "@/lib/http";
import { isAuthorizedInternalRequest } from "@/services/auth/internal-auth";
import { syncSeries } from "@/services/external/sync";

export async function POST() {
  const authorized = await isAuthorizedInternalRequest();
  if (!authorized) {
    return jsonError("Unauthorized", 401);
  }

  const result = await syncSeries();
  return jsonOk(result);
}
