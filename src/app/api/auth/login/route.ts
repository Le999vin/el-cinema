import { loginInputSchema } from "@/domain/schemas";
import { jsonError, jsonOk } from "@/lib/http";
import { getSafeAuthErrorMessage } from "@/services/auth/api-errors";
import { getSessionCookiePayload, loginUser } from "@/services/auth/auth-service";

export async function POST(request: Request) {
  try {
    const payload = loginInputSchema.parse(await request.json());
    const session = await loginUser(payload);

    const response = jsonOk({ user: session.user });
    const cookie = getSessionCookiePayload(session.token, session.expiresAt);
    response.cookies.set(cookie.name, cookie.value, cookie.options);

    return response;
  } catch (error) {
    return jsonError(getSafeAuthErrorMessage(error, "Login failed."), 401);
  }
}
