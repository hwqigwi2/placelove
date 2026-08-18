import type { PublicUser } from "./types";

/**
 * Доступ к заданиям есть только у активированного пользователя.
 * Всем остальным (включая ещё не авторизованных) показываем ActivationSheet.
 */
export function requiresActivation(user: PublicUser | null): boolean {
  return !user || !user.is_active;
}
