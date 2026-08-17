import { SignJWT, jwtVerify } from "jose";
import { SESSION_MAX_AGE_SECONDS } from "./constants";

export interface SessionPayload {
  userId: string;
}

/** Лениво читаем секрет — build не падает без env, ошибка только при реальном вызове */
function getSecret(secretOverride?: string): Uint8Array {
  const secret = secretOverride ?? process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET is not configured (min 32 chars)");
  }
  return new TextEncoder().encode(secret);
}

/** Подписывает сессионный JWT (HS256), срок ~30 дней */
export async function createSessionToken(
  userId: string,
  secretOverride?: string,
): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret(secretOverride));
}

/** Верифицирует JWT и возвращает payload или null */
export async function verifySessionToken(
  token: string,
  secretOverride?: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(secretOverride));
    if (typeof payload.userId !== "string") return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}
