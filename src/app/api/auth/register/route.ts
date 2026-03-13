import { registerInputSchema } from "@/domain/schemas";
import { jsonCreated, jsonError } from "@/lib/http";
import { getSafeAuthErrorMessage } from "@/services/auth/api-errors";
import {
  getSessionCookiePayload,
  loginUser,
  registerUser,
} from "@/services/auth/auth-service";

export async function POST(request: Request) {
  try {
    const payload = registerInputSchema.parse(await request.json());
    await registerUser(payload);
    const session = await loginUser({ email: payload.email, password: payload.password });

    const response = jsonCreated({ user: session.user });
    const cookie = getSessionCookiePayload(session.token, session.expiresAt);
    response.cookies.set(cookie.name, cookie.value, cookie.options);

    return response;
  } catch (error) {
    return jsonError(getSafeAuthErrorMessage(error, "Registration failed."), 400);
  }
}
