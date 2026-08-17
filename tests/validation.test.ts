import { describe, expect, it } from "vitest";
import {
  isValidEmail,
  isValidPassword,
  isValidTelegramUsername,
  normalizeEmail,
  normalizeTelegramUsername,
} from "@/lib/validation";

describe("email validation", () => {
  it("принимает корректные email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("  User.Name+tag@sub.domain.ru ")).toBe(true);
  });

  it("отклоняет некорректные email", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("user example.com")).toBe(false);
    expect(isValidEmail("user@example")).toBe(false);
  });

  it("normalizeEmail тримит и приводит к нижнему регистру", () => {
    expect(normalizeEmail("  User@Example.COM ")).toBe("user@example.com");
  });
});

describe("password validation", () => {
  it("минимальная длина 6 символов", () => {
    expect(isValidPassword("12345")).toBe(false);
    expect(isValidPassword("123456")).toBe(true);
    expect(isValidPassword("")).toBe(false);
  });
});

describe("telegram username validation", () => {
  it("принимает username с @ и без", () => {
    expect(isValidTelegramUsername("@ivan_petrov")).toBe(true);
    expect(isValidTelegramUsername("ivan_petrov")).toBe(true);
    expect(isValidTelegramUsername("a1_")).toBe(true);
  });

  it("нормализует к виду @xxx в нижнем регистре", () => {
    expect(normalizeTelegramUsername("Ivan_Petrov")).toBe("@ivan_petrov");
    expect(normalizeTelegramUsername("@@Ivan")).toBe("@ivan");
    expect(normalizeTelegramUsername(" ivan ")).toBe("@ivan");
  });

  it("отклоняет недопустимые символы и длину", () => {
    expect(isValidTelegramUsername("ab")).toBe(false);
    expect(isValidTelegramUsername("иван")).toBe(false);
    expect(isValidTelegramUsername("ivan-petrov")).toBe(false);
    expect(isValidTelegramUsername("ivan petrov")).toBe(false);
    expect(isValidTelegramUsername("")).toBe(false);
    expect(isValidTelegramUsername("a".repeat(33))).toBe(false);
  });
});
