import { NextRequest, NextResponse } from "next/server";
import { sendStartMessage } from "@/lib/bot";

interface WebhookMessage {
  chat: { id: number };
  from?: { id: number; first_name?: string };
  text?: string;
}

// Telegram присылает команды и как "/start", и как "/start@BotName".
function matchCommand(text: string, command: string): boolean {
  const normalized = text.trim().toLowerCase();
  if (normalized === command) return true;
  const atIndex = normalized.indexOf("@");
  return atIndex > 0 && normalized.slice(0, atIndex) === command;
}

/**
 * Webhook Telegram-бота. Единственная пользовательская команда — /start:
 * приветствие с inline-кнопкой, открывающей Mini App.
 * Регистрации через бота нет — пользователь создаётся при открытии Mini App.
 */
export async function POST(request: NextRequest) {
  try {
    // Если задан секрет вебхука — проверяем заголовок Telegram.
    const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (
      expected &&
      request.headers.get("x-telegram-bot-api-secret-token") !== expected
    ) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const update = (await request.json()) as { message?: WebhookMessage };
    const message = update.message;
    if (!message?.text) return NextResponse.json({ ok: true });

    if (matchCommand(message.text, "/start")) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (!appUrl) throw new Error("Mini app URL is missing.");
      await sendStartMessage(
        message.chat.id,
        message.from?.first_name ?? "",
        appUrl,
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Bot webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
