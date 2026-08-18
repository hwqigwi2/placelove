import { describe, expect, it } from "vitest";
import { getHistoryItems } from "@/lib/history";

describe("history", () => {
  it("у всех пользователей история пустая (empty state)", () => {
    expect(getHistoryItems()).toEqual([]);
  });
});
