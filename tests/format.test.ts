import { describe, expect, it } from "vitest";
import { formatReward } from "@/lib/format";

const NBSP = " ";

describe("formatReward", () => {
  it("форматирует с неразрывным пробелом-разделителем тысяч", () => {
    expect(formatReward(2500)).toBe(`+${NBSP}2${NBSP}500${NBSP}₽`);
    expect(formatReward(1500)).toBe(`+${NBSP}1${NBSP}500${NBSP}₽`);
    expect(formatReward(4000)).toBe(`+${NBSP}4${NBSP}000${NBSP}₽`);
  });

  it("суммы без тысяч форматируются без разделителя", () => {
    expect(formatReward(500)).toBe(`+${NBSP}500${NBSP}₽`);
  });

  it("использует именно неразрывный пробел (U+00A0)", () => {
    const formatted = formatReward(3500);
    expect(formatted).toContain(NBSP);
    expect(formatted).not.toMatch(/\+ \d/); // нет обычного пробела после +
  });
});
