export const MIN_PASSWORD_LENGTH = 6;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEGRAM_USERNAME_RE = /^[a-z0-9_]{3,32}$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(normalizeEmail(email));
}

export function isValidPassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}

/**
 * Нормализует Telegram username к виду «@xxx».
 * Допустимы a-z, 0-9 и подчёркивание; регистр приводится к нижнему.
 */
export function normalizeTelegramUsername(raw: string): string {
  const cleaned = raw.trim().replace(/^@+/, "").toLowerCase();
  return `@${cleaned}`;
}

export function isValidTelegramUsername(raw: string): boolean {
  const normalized = normalizeTelegramUsername(raw);
  return TELEGRAM_USERNAME_RE.test(normalized.slice(1));
}
