import { describe, expect, it } from "vitest";
import { toPublicUser, type DbUser } from "@/lib/types";

const DB_USER: DbUser = {
  id: "uuid-1",
  telegram_id: 123456789,
  first_name: "Ivan",
  username: "ivan_petrov",
  avatar_url: "https://t.me/i/userpic/320/ivan.jpg",
  is_active: false,
  created_at: "2026-08-18T00:00:00Z",
  updated_at: "2026-08-18T00:00:00Z",
};

describe("toPublicUser", () => {
  it("отдаёт только Telegram-поля", () => {
    expect(toPublicUser(DB_USER)).toEqual({
      id: DB_USER.id,
      telegram_id: DB_USER.telegram_id,
      first_name: DB_USER.first_name,
      username: DB_USER.username,
      avatar_url: DB_USER.avatar_url,
      is_active: DB_USER.is_active,
    });
  });

  it("email и password больше не используются", () => {
    const user = toPublicUser(DB_USER) as unknown as Record<string, unknown>;
    expect(user).not.toHaveProperty("email");
    expect(user).not.toHaveProperty("password");
    expect(user).not.toHaveProperty("password_hash");
    expect(user).not.toHaveProperty("telegram_username");
  });
});
