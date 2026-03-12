import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/services/auth/password";
import { generateSessionToken, hashSessionToken } from "@/services/auth/session";

describe("auth boundaries", () => {
  it("hashes and verifies passwords", async () => {
    const password = "StrongPassword!123";
    const hash = await hashPassword(password);
    const valid = await verifyPassword(password, hash);

    expect(valid).toBe(true);
  });

  it("creates stable session token hash", () => {
    const token = generateSessionToken();
    const hashA = hashSessionToken(token);
    const hashB = hashSessionToken(token);

    expect(hashA).toHaveLength(64);
    expect(hashA).toBe(hashB);
  });
});

