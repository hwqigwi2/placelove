import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  MAX_AUTH_DATE_AGE_SECONDS,
  TelegramAuthError,
  validateInitData,
} from "@/lib/telegram";

const BOT_TOKEN = "test-bot-token:secret";

const USER = {
  id: 123456789,
  first_name: "Ivan",
  username: "ivan_petrov",
  photo_url: "https://t.me/i/userpic/320/ivan.jpg",
};

function sign(params: Record<string, string>, token: string): string {
  const dataCheckString = Object.keys(params)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => `${key}=${params[key]}`)
    .join("\n");
  const secret = crypto
    .createHmac("sha256", "WebAppData")
    .update(token)
    .digest();
  return crypto
    .createHmac("sha256", secret)
    .update(dataCheckString)
    .digest("hex");
}

function buildInitData(
  overrides: {
    params?: Record<string, string>;
    token?: string;
    includeHash?: boolean;
  } = {},
): string {
  const params: Record<string, string> = {
    auth_date: String(Math.floor(Date.now() / 1000)),
    query_id: "AAHdVl8qAAAAAN1WXyoAAAAA",
    user: JSON.stringify(USER),
    ...overrides.params,
  };
  const search = new URLSearchParams(params);
  if (overrides.includeHash !== false) {
    search.set("hash", sign(params, overrides.token ?? BOT_TOKEN));
  }
  return search.toString();
}

describe("validateInitData", () => {
  it("принимает валидный initData и возвращает Telegram user", () => {
    const user = validateInitData(buildInitData(), undefined, BOT_TOKEN);
    expect(user.id).toBe(USER.id);
    expect(user.first_name).toBe(USER.first_name);
    expect(user.username).toBe(USER.username);
    expect(user.photo_url).toBe(USER.photo_url);
  });

  it("отклоняет неправильный hash", () => {
    const initData = buildInitData({ token: "wrong-token" });
    expect(() => validateInitData(initData, undefined, BOT_TOKEN)).toThrow(
      TelegramAuthError,
    );
  });

  it("отклоняет initData без hash", () => {
    const initData = buildInitData({ includeHash: false });
    expect(() => validateInitData(initData, undefined, BOT_TOKEN)).toThrow(
      TelegramAuthError,
    );
  });

  it("отклоняет просроченный auth_date", () => {
    const now = Math.floor(Date.now() / 1000);
    const initData = buildInitData({
      params: {
        auth_date: String(now - MAX_AUTH_DATE_AGE_SECONDS - 60),
      },
    });
    expect(() => validateInitData(initData, now, BOT_TOKEN)).toThrow(
      TelegramAuthError,
    );
  });

  it("отклоняет подменённого пользователя (подпись не сходится)", () => {
    const valid = buildInitData();
    const tampered = valid.replace(USER.first_name, "Admin");
    expect(() => validateInitData(tampered, undefined, BOT_TOKEN)).toThrow(
      TelegramAuthError,
    );
  });

  it("отклоняет initData без user", () => {
    const params = { auth_date: String(Math.floor(Date.now() / 1000)) };
    const initData = new URLSearchParams({
      ...params,
      hash: sign(params, BOT_TOKEN),
    }).toString();
    expect(() => validateInitData(initData, undefined, BOT_TOKEN)).toThrow(
      TelegramAuthError,
    );
  });
});
