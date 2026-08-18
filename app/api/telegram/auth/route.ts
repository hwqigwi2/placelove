import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db";
import { TelegramAuthError, validateInitData } from "@/lib/telegram";
import { upsertTelegramUser } from "@/lib/users";
import { getClientIp, limitTelegramAuth } from "@/lib/ratelimit";

const MAX_INIT_DATA_LENGTH = 8192;

/**
 * Авторизация Mini App: клиент присылает window.Telegram.WebApp.initData,
 * сервер проверяет HMAC-подпись Telegram и делает upsert пользователя.
 * Клиентским данным без валидной подписи сервер не доверяет.
 */
export async function POST(request: Request) {
  if (!limitTelegramAuth(getClientIp(request))) {
    return NextResponse.json(
      { error: "Слишком много попыток. Попробуйте позже." },
      { status: 429 },
    );
  }

  let initData: unknown;
  try {
    const body = (await request.json()) as { initData?: unknown };
    initData = body?.initData;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  if (
    typeof initData !== "string" ||
    initData.length === 0 ||
    initData.length > MAX_INIT_DATA_LENGTH
  ) {
    return NextResponse.json(
      { error: "Не удалось определить аккаунт Telegram." },
      { status: 401 },
    );
  }

  try {
    const telegramUser = validateInitData(initData);
    const user = await upsertTelegramUser(getSupabaseAdmin(), telegramUser);
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof TelegramAuthError) {
      return NextResponse.json(
        { error: "Не удалось определить аккаунт Telegram." },
        { status: 401 },
      );
    }
    console.error("Telegram auth error:", error);
    return NextResponse.json(
      { error: "Не удалось загрузить данные. Попробуйте ещё раз." },
      { status: 500 },
    );
  }
}
