import { describe, expect, it } from "vitest";
import { BALANCE_TOAST_MS, MIN_WITHDRAWAL_RUB } from "@/lib/constants";

describe("balance toast", () => {
  it("минимальная сумма вывода — 1 000 ₽", () => {
    expect(MIN_WITHDRAWAL_RUB).toBe(1000);
  });

  it("toast скрывается примерно через 5 секунд", () => {
    expect(BALANCE_TOAST_MS).toBe(5000);
  });
});
