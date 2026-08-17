import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "@/lib/session";

const SECRET = "test-secret-key-with-32-plus-characters!!";
const OTHER_SECRET = "another-secret-key-with-32-plus-chars!";

describe("session token (jose HS256)", () => {
  it("sign/verify roundtrip возвращает userId", async () => {
    const token = await createSessionToken("user-123", SECRET);
    const payload = await verifySessionToken(token, SECRET);
    expect(payload).toEqual({ userId: "user-123" });
  });

  it("отклоняет токен, подписанный другим секретом", async () => {
    const token = await createSessionToken("user-123", SECRET);
    const payload = await verifySessionToken(token, OTHER_SECRET);
    expect(payload).toBeNull();
  });

  it("отклоняет подделанный токен", async () => {
    const token = await createSessionToken("user-123", SECRET);
    const [header, , signature] = token.split(".");
    const forgedPayload = Buffer.from(
      JSON.stringify({ userId: "admin", exp: 9999999999 }),
    ).toString("base64url");
    const forged = `${header}.${forgedPayload}.${signature}`;
    expect(await verifySessionToken(forged, SECRET)).toBeNull();
  });

  it("отклоняет мусор вместо токена", async () => {
    expect(await verifySessionToken("not-a-jwt", SECRET)).toBeNull();
    expect(await verifySessionToken("", SECRET)).toBeNull();
  });

  it("бросает ошибку без секрета (но не при импорте модуля)", async () => {
    await expect(createSessionToken("user-123", "")).rejects.toThrow(
      /AUTH_SECRET/,
    );
  });
});
