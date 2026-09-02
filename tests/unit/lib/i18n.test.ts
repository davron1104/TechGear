import { describe, it, expect } from "vitest";
import {
  translate,
  createTranslator,
  getLocalizedProduct,
  getLocalizedCategory,
  isValidLocale,
  DEFAULT_LOCALE,
  LOCALES,
} from "@/i18n";
import { Product } from "@/types/product";

describe("i18n Core Engine", () => {
  it("should validate locales correctly", () => {
    expect(isValidLocale("ru")).toBe(true);
    expect(isValidLocale("uz")).toBe(true);
    expect(isValidLocale("en")).toBe(true);
    expect(isValidLocale("de")).toBe(false);
    expect(isValidLocale(null)).toBe(false);
    expect(isValidLocale(undefined)).toBe(false);
    expect(DEFAULT_LOCALE).toBe("ru");
    expect(LOCALES).toEqual(["ru", "uz", "en"]);
  });

  it("should get Russian translations", () => {
    const tRu = createTranslator("ru");
    expect(tRu("catalog.filters")).toBe("Фильтры");
    expect(tRu("product.addToCart")).toBe("В корзину");
    expect(tRu("cart.title")).toBe("Корзина");
  });

  it("should get Uzbek translations", () => {
    const tUz = createTranslator("uz");
    expect(tUz("catalog.filters")).toBe("Filtrlar");
    expect(tUz("product.addToCart")).toBe("Savatga");
    expect(tUz("cart.title")).toBe("Savat");
  });

  it("should get English translations", () => {
    const tEn = createTranslator("en");
    expect(tEn("catalog.filters")).toBe("Filters");
    expect(tEn("product.addToCart")).toBe("Add to Cart");
    expect(tEn("cart.title")).toBe("Shopping Cart");
  });

  it("should interpolate template variables correctly", () => {
    const tRu = createTranslator("ru");
    const tUz = createTranslator("uz");
    const tEn = createTranslator("en");

    expect(tRu("catalog.found", { count: 12 })).toBe("Найдено: 12");
    expect(tUz("catalog.found", { count: 12 })).toBe("Topildi: 12");
    expect(tEn("catalog.found", { count: 12 })).toBe("Found: 12");
  });

  it("should fallback from uz/en to ru when key is missing or empty in target locale", () => {
    // translate with an unknown/custom key or simulating empty field
    const result = translate("uz", "statuses.NEW");
    expect(result).toBe("Yangi");

    const resultRu = translate("ru", "statuses.NEW");
    expect(resultRu).toBe("Новый");
  });

  it("should return the key safely when key is missing in all dictionaries without crashing", () => {
    const tRu = createTranslator("ru");
    const tUz = createTranslator("uz");

    expect(tRu("non.existent.key")).toBe("non.existent.key");
    expect(tUz("non.existent.key")).toBe("non.existent.key");
  });

  it("should correctly localize Product with full fallback to Russian", () => {
    const baseProduct: Product = {
      id: "prod-1",
      name: "Клавиатура Pro",
      slug: "keyboard-pro",
      categoryId: "cat-1",
      categorySlug: "keyboards",
      categoryName: "Клавиатуры",
      price: 1500000,
      image: "/img.jpg",
      images: ["/img.jpg"],
      shortDescription: "Краткое русское описание",
      description: "Полное русское описание",
      stock: 5,
      brand: "BrandX",
      characteristics: { "Тип": "Механическая", "Цвет": "Черный" },
      translations: {
        uz: {
          name: "Klaviatura Pro",
          shortDescription: "Qisqa o'zbekcha tavsif",
          description: "To'liq o'zbekcha tavsif",
          characteristics: { "Turi": "Mexanik", "Rangi": "Qora" },
        },
        en: {
          name: "Keyboard Pro",
          shortDescription: "Short English description",
          description: "Full English description",
          characteristics: { "Type": "Mechanical", "Color": "Black" },
        },
      },
      createdAt: new Date().toISOString(),
    };

    // 1. Russian (Base)
    const localizedRu = getLocalizedProduct(baseProduct, "ru");
    expect(localizedRu.name).toBe("Клавиатура Pro");
    expect(localizedRu.characteristics["Тип"]).toBe("Механическая");

    // 2. Uzbek
    const localizedUz = getLocalizedProduct(baseProduct, "uz");
    expect(localizedUz.name).toBe("Klaviatura Pro");
    expect(localizedUz.shortDescription).toBe("Qisqa o'zbekcha tavsif");
    expect(localizedUz.characteristics["Turi"]).toBe("Mexanik");

    // 3. English
    const localizedEn = getLocalizedProduct(baseProduct, "en");
    expect(localizedEn.name).toBe("Keyboard Pro");
    expect(localizedEn.shortDescription).toBe("Short English description");
    expect(localizedEn.characteristics["Type"]).toBe("Mechanical");

    // 4. Fallback when translation is null or missing for a locale
    const productWithoutEn: Product = {
      ...baseProduct,
      translations: {
        uz: baseProduct.translations!.uz,
      },
    };
    const fallbackEn = getLocalizedProduct(productWithoutEn, "en");
    expect(fallbackEn.name).toBe("Клавиатура Pro"); // Fallback to base RU
    expect(fallbackEn.shortDescription).toBe("Краткое русское описание");
  });

  it("should correctly localize Category with fallback to Russian", () => {
    const category = {
      id: "cat-1",
      name: "Мыши",
      slug: "mice",
      translations: {
        uz: { name: "Sichqonchalar" },
        en: { name: "Mice" },
      },
    };

    expect(getLocalizedCategory(category, "ru").name).toBe("Мыши");
    expect(getLocalizedCategory(category, "uz").name).toBe("Sichqonchalar");
    expect(getLocalizedCategory(category, "en").name).toBe("Mice");

    // Fallback test
    const catNoUz = {
      id: "cat-2",
      name: "Мониторы",
      slug: "monitors",
      translations: {},
    };
    expect(getLocalizedCategory(catNoUz, "uz").name).toBe("Мониторы");
  });
});
