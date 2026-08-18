import crypto from "node:crypto";
import type { TelegramUser } from "./types";

export class TelegramAuthError extends Error {}

// initData генерируется при каждом запуске Mini App, поэтому достаточно
// короткого окна валидности — украденная подпись быстро протухает.
export const MAX_AUTH_DATE_AGE_SECONDS = 3600;

/**
 * Проверяет подпись Telegram initData (HMAC-SHA256, секрет "WebAppData")
 * и возвращает Telegram user. Данным клиента без валидной подписи не доверяем.
 * nowSeconds/tokenOverride — только для тестов.
 */
export function validateInitData(
  initData: string,
  nowSeconds: number = Date.now() / 1000,
  tokenOverride?: string,
): TelegramUser {
  const token = tokenOverride ?? process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !initData) {
    throw new TelegramAuthError("Telegram authentication is unavailable.");
  }

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) throw new TelegramAuthError("Invalid Telegram data.");
  params.delete("hash");

  const authDate = Number(params.get("auth_date"));
  if (!authDate || Math.abs(nowSeconds - authDate) > MAX_AUTH_DATE_AGE_SECONDS) {
    throw new TelegramAuthError("Telegram data has expired.");
  }

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secret = crypto
    .createHmac("sha256", "WebAppData")
    .update(token)
    .digest();
  const expected = crypto
    .createHmac("sha256", secret)
    .update(dataCheckString)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const hashBuf = Buffer.from(hash, "utf8");
  if (
    expectedBuf.length !== hashBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, hashBuf)
  ) {
    throw new TelegramAuthError("Telegram signature is invalid.");
  }

  const rawUser = params.get("user");
  if (!rawUser) throw new TelegramAuthError("Telegram user is missing.");

  let user: TelegramUser;
  try {
    user = JSON.parse(rawUser) as TelegramUser;
  } catch {
    throw new TelegramAuthError("Telegram user is invalid.");
  }
  if (!Number.isSafeInteger(user.id) || !user.first_name) {
    throw new TelegramAuthError("Telegram user is invalid.");
  }
  return user;
}
