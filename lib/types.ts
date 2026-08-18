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

/** Пользователь Telegram из подписанного initData */
export interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
  photo_url?: string;
}

export interface DbUser {
  id: string;
  telegram_id: number;
  first_name: string;
  username: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Только публичные поля, которые можно отдавать на клиент */
export interface PublicUser {
  id: string;
  telegram_id: number;
  first_name: string;
  username: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

export function toPublicUser(user: DbUser): PublicUser {
  return {
    id: user.id,
    telegram_id: user.telegram_id,
    first_name: user.first_name,
    username: user.username,
    avatar_url: user.avatar_url,
    is_active: user.is_active,
  };
}
