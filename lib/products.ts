import type { Product } from "./types";

/**
 * Статическая конфигурация каталога.
 * Ровно 9 товаров, порядок строго фиксирован.
 * Вознаграждения фиксированы и одинаковы для всех пользователей.
 * Обычная цена товара намеренно отсутствует.
 */
export const ALLOWED_REWARDS = [
  1500,
  2000,
  2500,
  3000,
  3500,
  4000,
] as const;

export const PRODUCTS: readonly Product[] = [
  {
    id: "triko",
    title: "Трико джоггеры спортивные подростковые",
    image: "/products/triko.jpg",
    reward: 2500,
    marketplace: "wb",
  },
  {
    id: "long",
    title: "Лонгслив оверсайз с принтом",
    image: "/products/long.jpg",
    reward: 3500,
    marketplace: "ozon",
  },
  {
    id: "gel",
    title: "Гель для душа с кислотами от прыщей очищающий",
    image: "/products/gel.jpg",
    reward: 2000,
    marketplace: "wb",
  },
  {
    id: "ruk",
    title: "Рюкзак школьный для мальчика 4 в 1",
    image: "/products/ruk.jpg",
    reward: 3000,
    marketplace: "ozon",
  },
  {
    id: "penka",
    title: "Пенка для умывания от прыщей, увлажняющая с микробиом",
    image: "/products/penka.jpg",
    reward: 2500,
    marketplace: "wb",
  },
  {
    id: "136",
    title: "Матовая помада для губ увлажняющая тон",
    image: "/products/136.jpg",
    reward: 1500,
    marketplace: "ozon",
  },
  {
    id: "brit",
    title: "Бритва для бровей и лица",
    image: "/products/brit.jpg",
    reward: 1500,
    marketplace: "wb",
  },
  {
    id: "gaba",
    title: "Духи GABA 23ml",
    image: "/products/gaba.jpg",
    reward: 2000,
    marketplace: "ozon",
  },
  {
    id: "buts",
    title: "Бутсы футбольные с шипами и носком",
    image: "/products/buts.jpg",
    reward: 4000,
    marketplace: "wb",
  },
] as const;

/** Соотношение сторон фото товаров (~1178×1569) */
export const PRODUCT_IMAGE_WIDTH = 1178;
export const PRODUCT_IMAGE_HEIGHT = 1569;