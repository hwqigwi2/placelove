import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildUserUpsert, upsertTelegramUser } from "@/lib/users";
import type { DbUser, TelegramUser } from "@/lib/types";

const TG_USER: TelegramUser = {
  id: 123456789,
  first_name: "Ivan",
  username: "ivan_petrov",
  photo_url: "https://t.me/i/userpic/320/ivan.jpg",
};

function fakeDb(row: DbUser) {
  const calls: { payload: unknown; options: unknown }[] = [];
  const chain = {
    from() {
      return chain;
    },
    upsert(payload: unknown, options: unknown) {
      calls.push({ payload, options });
      return chain;
    },
    select() {
      return chain;
    },
    async single() {
      return { data: row, error: null };
    },
  };
  return { db: chain as unknown as SupabaseClient, calls };
}

function dbUser(overrides: Partial<DbUser> = {}): DbUser {
  return {
    id: "uuid-1",
    telegram_id: TG_USER.id,
    first_name: TG_USER.first_name,
    username: TG_USER.username ?? null,
    avatar_url: TG_USER.photo_url ?? null,
    is_active: false,
    created_at: "2026-08-18T00:00:00Z",
    updated_at: "2026-08-18T00:00:00Z",
    ...overrides,
  };
}

describe("buildUserUpsert", () => {
  it("содержит telegram поля и не содержит is_active", () => {
    const payload = buildUserUpsert(TG_USER);
    expect(payload).toEqual({
      telegram_id: TG_USER.id,
      first_name: TG_USER.first_name,
      username: TG_USER.username,
      avatar_url: TG_USER.photo_url,
    });
    expect(payload).not.toHaveProperty("is_active");
  });

  it("username и avatar_url становятся null, если Telegram их не дал", () => {
    const payload = buildUserUpsert({ id: 1, first_name: "Ivan" });
    expect(payload.username).toBeNull();
    expect(payload.avatar_url).toBeNull();
  });
});

describe("upsertTelegramUser", () => {
  it("создаёт нового пользователя (is_active по умолчанию false)", async () => {
    const { db, calls } = fakeDb(dbUser());
    const user = await upsertTelegramUser(db, TG_USER);
    expect(user.telegram_id).toBe(TG_USER.id);
    expect(user.is_active).toBe(false);
    expect(calls).toHaveLength(1);
    expect(calls[0].options).toEqual({ onConflict: "telegram_id" });
  });

  it("обновляет существующего пользователя, не сбрасывая is_active", async () => {
    const { db, calls } = fakeDb(dbUser({ is_active: true }));
    const user = await upsertTelegramUser(db, {
      ...TG_USER,
      first_name: "Ivan Updated",
    });
    // payload не содержит is_active — БД сохраняет текущее значение
    expect(calls[0].payload).not.toHaveProperty("is_active");
    expect(user.is_active).toBe(true);
  });
});
