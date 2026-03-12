import { NextResponse } from "next/server";

import { jsonError } from "@/lib/http";
import type { SafeUser } from "@/services/auth/auth-service";
import { resolveCurrentUser } from "@/services/auth/auth-service";

export const requireApiUser = async (): Promise<SafeUser | NextResponse> => {
  const user = await resolveCurrentUser();
  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  return user;
};

export const requireApiAdmin = async (): Promise<SafeUser | NextResponse> => {
  const user = await resolveCurrentUser();
  if (!user) {
    return jsonError("Unauthorized", 401);
  }

  if (user.role !== "admin") {
    return jsonError("Forbidden", 403);
  }

  return user;
};

