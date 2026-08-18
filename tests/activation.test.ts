import { describe, expect, it } from "vitest";
import { requiresActivation } from "@/lib/activation";
import type { PublicUser } from "@/lib/types";

function user(is_active: boolean): PublicUser {
  return {
    id: "uuid-1",
    telegram_id: 123456789,
    first_name: "Ivan",
    username: null,
    avatar_url: null,
    is_active,
  };
}

describe("requiresActivation", () => {
  it("неактивный пользователь получает activation sheet", () => {
    expect(requiresActivation(user(false))).toBe(true);
  });

  it("активный пользователь не получает activation sheet", () => {
    expect(requiresActivation(user(true))).toBe(false);
  });

  it("без пользователя (нет initData) тоже показываем activation sheet", () => {
    expect(requiresActivation(null)).toBe(true);
  });
});
