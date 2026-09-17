import { describe, it, expect } from "vitest";
import { productSchema } from "@/lib/validations/product";

describe("Product Zod Validation Schema (productSchema)", () => {
  const validProductInput = {
    name: "Игровая мышь TechGear CyberPulse Pro",
    slug: "techgear-cyberpulse-pro",
    categoryId: "cat-1",
    price: 450000, // 450 000 UZS
    brand: "TechGear",
    stock: 25,
    image: "/uploads/products/cyberpulse.jpg",
    images: ["/uploads/products/cyberpulse.jpg", "/uploads/products/cyberpulse-2.jpg"],
    shortDescription: "Беспроводная мышь с оптическим сенсором 26000 DPI.",
    description: "Профессиональная мышь для киберспорта и продуктивной работы.",
    characteristics: {
      "Сенсор": "PixArt PAW3395",
      "Вес": "58 г",
    },
    isPopular: true,
  };

  it("should successfully validate valid product with standard UZS price", () => {
    const result = productSchema.safeParse(validProductInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(450000);
      expect(result.data.name).toBe("Игровая мышь TechGear CyberPulse Pro");
    }
  });

  it("should accept maximum valid UZS price matching Decimal(10, 2) boundary (99 999 999.99)", () => {
    const result = productSchema.safeParse({
      ...validProductInput,
      price: 99_999_999.99,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(99_999_999.99);
    }
  });

  it("should reject price exceeding 99 999 999.99", () => {
    const result = productSchema.safeParse({
      ...validProductInput,
      price: 100_000_000,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.price).toBeDefined();
      expect(errors.price?.[0]).toContain("99 999 999.99");
    }
  });

  it("should reject 0 or negative prices", () => {
    const zeroResult = productSchema.safeParse({
      ...validProductInput,
      price: 0,
    });
    expect(zeroResult.success).toBe(false);

    const negativeResult = productSchema.safeParse({
      ...validProductInput,
      price: -5000,
    });
    expect(negativeResult.success).toBe(false);
  });

  it("should reject negative stock", () => {
    const result = productSchema.safeParse({
      ...validProductInput,
      stock: -1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.stock).toBeDefined();
    }
  });

  it("should reject invalid slug format", () => {
    const result = productSchema.safeParse({
      ...validProductInput,
      slug: "invalid slug with spaces!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.slug).toBeDefined();
    }
  });

  describe("translations validation", () => {
    it("should accept valid full translations for uz and en", () => {
      const result = productSchema.safeParse({
        ...validProductInput,
        translations: {
          uz: {
            name: "TechGear CyberPulse Pro O'yin Sichqonchasi",
            shortDescription: "26000 DPI optik sensorli simsiz sichqoncha.",
            description: "Kibersport va samarali ish uchun professional sichqoncha.",
            characteristics: {
              "Sensor": "PixArt PAW3395",
              "Vazn": "58 g",
            },
          },
          en: {
            name: "TechGear CyberPulse Pro Gaming Mouse",
            shortDescription: "Wireless mouse with 26000 DPI optical sensor.",
            description: "Professional gaming and productivity mouse.",
            characteristics: {
              "Sensor": "PixArt PAW3395",
              "Weight": "58 g",
            },
          },
        },
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.translations?.uz?.name).toBe(
          "TechGear CyberPulse Pro O'yin Sichqonchasi"
        );
        expect(result.data.translations?.en?.characteristics?.["Weight"]).toBe("58 g");
      }
    });

    it("should accept partial translations (e.g. only uz or only name)", () => {
      const result = productSchema.safeParse({
        ...validProductInput,
        translations: {
          uz: {
            name: "TechGear CyberPulse Pro UZ",
          },
        },
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.translations?.uz?.name).toBe("TechGear CyberPulse Pro UZ");
        expect(result.data.translations?.uz?.description).toBeUndefined();
        expect(result.data.translations?.en).toBeUndefined();
      }
    });

    it("should accept translations: null and translations: undefined", () => {
      const nullResult = productSchema.safeParse({
        ...validProductInput,
        translations: null,
      });
      expect(nullResult.success).toBe(true);

      const undefinedResult = productSchema.safeParse({
        ...validProductInput,
        translations: undefined,
      });
      expect(undefinedResult.success).toBe(true);
    });

    it("should accept empty optional translation fields", () => {
      const result = productSchema.safeParse({
        ...validProductInput,
        translations: {
          uz: {},
          en: {
            characteristics: {},
          },
        },
      });
      expect(result.success).toBe(true);
    });

    it("should reject translation name exceeding 200 characters", () => {
      const result = productSchema.safeParse({
        ...validProductInput,
        translations: {
          en: {
            name: "A".repeat(201),
          },
        },
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const hasNameError = result.error.issues.some(
          (issue) => issue.path.join(".") === "translations.en.name"
        );
        expect(hasNameError).toBe(true);
      }
    });

    it("should reject translation shortDescription exceeding 500 characters", () => {
      const result = productSchema.safeParse({
        ...validProductInput,
        translations: {
          uz: {
            shortDescription: "B".repeat(501),
          },
        },
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const hasDescError = result.error.issues.some(
          (issue) => issue.path.join(".") === "translations.uz.shortDescription"
        );
        expect(hasDescError).toBe(true);
      }
    });
  });
});
