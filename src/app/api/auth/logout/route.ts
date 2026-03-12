import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { jsonOk } from "@/lib/http";
import {
  getClearSessionCookiePayload,
  logoutWithToken,
} from "@/services/auth/auth-service";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await logoutWithToken(token);
  }

  const response = jsonOk({ ok: true });
  const clearCookie = getClearSessionCookiePayload();
  response.cookies.set(clearCookie.name, clearCookie.value, clearCookie.options);

  return response;
}

