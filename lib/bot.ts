/**
 * Минимальный клиент Telegram Bot API (только сервер).
 * Токен берётся из TELEGRAM_BOT_TOKEN, нигде не хардкодится.
 */
async function callBotApi(
  method: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Telegram bot configuration is missing.");

  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Telegram API error:", response.status, errorBody);
    throw new Error(`Telegram API rejected ${method}: ${response.status}`);
  }
}

/** /start: приветствие + inline-кнопка, открывающая Mini App (web_app). */
export async function sendStartMessage(
  chatId: number,
  firstName: string,
  miniAppUrl: string,
): Promise<void> {
  const name = firstName.trim() || "друг";
  await callBotApi("sendMessage", {
    chat_id: chatId,
    text:
      `Привет, ${name} 👋\n\n` +
      "Здесь ты можешь выполнять задания и получать вознаграждение.",
    reply_markup: {
      inline_keyboard: [
        [{ text: "Выполнять задания", web_app: { url: miniAppUrl } }],
      ],
    },
  });
}
