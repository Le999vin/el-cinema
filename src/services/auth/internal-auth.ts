import { headers } from "next/headers";

import { env } from "@/lib/env";
import { resolveCurrentUser } from "@/services/auth/auth-service";

export const isAuthorizedInternalRequest = async (): Promise<boolean> => {
  const user = await resolveCurrentUser();
  if (user?.role === "admin") {
    return true;
  }

  const syncSecret = env.INTERNAL_SYNC_SECRET;
  if (!syncSecret) {
    return false;
  }

  const headerStore = await headers();
  const provided = headerStore.get("x-internal-sync-secret");

  return provided === syncSecret;
};

