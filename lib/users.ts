import type { SupabaseClient } from "@supabase/supabase-js";
import type { DbUser, PublicUser, TelegramUser } from "./types";
import { toPublicUser } from "./types";

// Список полей, которые API разрешено читать из таблицы users.
// Никаких select('*'): это убережёт от утечки служебных колонок.
const USER_FIELDS =
  "id,telegram_id,first_name,username,avatar_url,is_active,created_at,updated_at";

/**
 * Payload для upsert Telegram-пользователя.
 * is_active здесь НЕТ специально: при insert подставится default false,
 * при конфликте (уже существующий пользователь) колонка не трогается —
 * активация, выданная менеджером, не сбрасывается повторным входом.
 */
export function buildUserUpsert(telegramUser: TelegramUser) {
  return {
    telegram_id: telegramUser.id,
    first_name: telegramUser.first_name,
    username: telegramUser.username ?? null,
    avatar_url: telegramUser.photo_url ?? null,
  };
}

/**
 * Создаёт пользователя при первом открытии Mini App или обновляет
 * first_name/username/avatar_url при следующих (updated_at — триггером в БД).
 */
export async function upsertTelegramUser(
  db: SupabaseClient,
  telegramUser: TelegramUser,
): Promise<PublicUser> {
  const { data, error } = await db
    .from("users")
    .upsert(buildUserUpsert(telegramUser), { onConflict: "telegram_id" })
    .select(USER_FIELDS)
    .single();

  if (error || !data) throw new Error("Unable to create user.");
  return toPublicUser(data as unknown as DbUser);
}
