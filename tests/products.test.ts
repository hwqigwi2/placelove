import { describe, expect, it } from "vitest";
import { ALLOWED_REWARDS, PRODUCTS } from "@/lib/products";

describe("products config", () => {
  it("содержит ровно 9 товаров", () => {
    expect(PRODUCTS).toHaveLength(9);
  });

  it("порядок товаров строго зафиксирован", () => {
    expect(PRODUCTS.map((p) => p.id)).toEqual([
      "triko",
      "long",
      "gel",
      "ruk",
      "penka",
      "136",
      "brit",
      "gaba",
      "buts",
    ]);
  });

  it("изображения лежат в /products/ и уникальны", () => {
    const images = PRODUCTS.map((p) => p.image);
    for (const image of images) {
      expect(image).toMatch(/^\/products\/.+\.jpg$/);
    }
    expect(new Set(images).size).toBe(images.length);
  });

  it("названия соответствуют ТЗ", () => {
    expect(PRODUCTS.map((p) => p.title)).toEqual([
      "Трико джоггеры спортивные подростковые",
      "Лонгслив оверсайз с принтом",
      "Гель для душа с кислотами от прыщей очищающий",
      "Рюкзак школьный для мальчика 4 в 1",
      "Пенка для умывания от прыщей, увлажняющая с микробиом",
      "Матовая помада для губ увлажняющая тон",
      "Бритва для бровей и лица",
      "Духи GABA 23ml",
      "Бутсы футбольные с шипами и носком",
    ]);
  });

  it("вознаграждения фиксированы и соответствуют распределению ТЗ", () => {
    const expected: Record<string, number> = {
      triko: 2500,
      long: 3500,
      gel: 2000,
      ruk: 3000,
      penka: 2500,
      "136": 1500,
      brit: 1500,
      gaba: 2000,
      buts: 4000,
    };
    for (const product of PRODUCTS) {
      expect(product.reward).toBe(expected[product.id]);
    }
  });

  it("все суммы из допустимого множества и заканчиваются на 000 или 500", () => {
    for (const product of PRODUCTS) {
      expect(ALLOWED_REWARDS).toContain(product.reward);
      expect([0, 500]).toContain(product.reward % 1000);
    }
  });

  it("5 товаров Wildberries и 4 товара Ozon", () => {
    const wb = PRODUCTS.filter((p) => p.marketplace === "wb");
    const ozon = PRODUCTS.filter((p) => p.marketplace === "ozon");
    expect(wb).toHaveLength(5);
    expect(ozon).toHaveLength(4);
  });

  it("у товара нет обычной цены", () => {
    for (const product of PRODUCTS) {
      expect(product).not.toHaveProperty("price");
    }
  });
});
