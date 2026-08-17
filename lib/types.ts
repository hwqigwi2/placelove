export type Marketplace = "wb" | "ozon";

export interface Product {
  /** Уникальный ID товара */
  id: string;

  /** Название товара */
  title: string;

  /** Путь к изображению товара */
  image: string;

  /** Фиксированное вознаграждение в рублях */
  reward: number;

  /** Маркетплейс товара */
  marketplace: Marketplace;
}

export interface DbUser {
  id: string;
  email: string;
  telegram_username: string;
  password_hash: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Только публичные поля, которые можно отдавать на клиент */
export interface PublicUser {
  id: string;
  email: string;
  telegram_username: string;
  is_active: boolean;
}

export function toPublicUser(user: DbUser): PublicUser {
  return {
    id: user.id,
    email: user.email,
    telegram_username: user.telegram_username,
    is_active: user.is_active,
  };
}