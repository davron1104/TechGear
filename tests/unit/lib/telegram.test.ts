import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  escapeHtml,
  formatOrderMessage,
  sendOrderTelegramNotification,
  TelegramOrderPayload,
} from "@/lib/telegram";

describe("Telegram Service", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = {
      ...originalEnv,
      TELEGRAM_BOT_TOKEN: "mock-bot-token-12345",
      TELEGRAM_CHAT_ID: "-1001234567890",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("escapeHtml", () => {
    it("should escape ampersand (&)", () => {
      expect(escapeHtml("Intel & AMD")).toBe("Intel &amp; AMD");
    });

    it("should escape less than (<) and greater than (>)", () => {
      expect(escapeHtml("<script>alert('xss')</script>")).toBe(
        "&lt;script&gt;alert('xss')&lt;/script&gt;"
      );
    });

    it("should return empty string for null and undefined", () => {
      expect(escapeHtml(null)).toBe("");
      expect(escapeHtml(undefined)).toBe("");
      expect(escapeHtml("")).toBe("");
    });

    it("should handle strings without special characters unchanged", () => {
      expect(escapeHtml("Ноутбук ASUS ROG")).toBe("Ноутбук ASUS ROG");
    });
  });

  describe("formatOrderMessage", () => {
    const baseOrder: TelegramOrderPayload = {
      orderNumber: "TG-A1B2C",
      createdAt: "2026-08-30T15:30:00.000Z",
      customerName: "Иван Иванов",
      customerPhone: "+7 (999) 123-45-67",
      customerEmail: "ivan@example.com",
      deliveryMethod: "courier",
      city: "Москва",
      street: "Ленина",
      house: "10",
      apartment: "25",
      comment: "Позвонить за 1 час",
      items: [
        {
          productName: "Механическая клавиатура Keychron K2",
          price: 9900,
          quantity: 1,
        },
      ],
      goodsTotal: 9900,
      deliveryCost: 0,
      totalAmount: 9900,
    };

    it("should format a single item order with courier delivery and address", () => {
      const message = formatOrderMessage(baseOrder);

      expect(message).toContain("📦 <b>Новый заказ №TG-A1B2C</b>");
      expect(message).toContain("👤 <b>Покупатель:</b> Иван Иванов");
      expect(message).toContain("📞 <b>Телефон:</b> +7 (999) 123-45-67");
      expect(message).toContain("✉️ <b>Email:</b> ivan@example.com");
      expect(message).toContain("🚚 <b>Способ доставки:</b> Курьерская доставка");
      expect(message).toContain(
        "📍 <b>Адрес:</b> г. Москва, ул. Ленина, д. 10, кв. 25"
      );
      expect(message).toContain("💬 <b>Комментарий:</b> Позвонить за 1 час");
      expect(message).toContain(
        "1. <b>Механическая клавиатура Keychron K2</b> — 1 шт. × 9"
      );
      expect(message).toContain("💵 <b>Итого к оплате:</b>");
    });

    it("should format multiple items with correct quantities and totals", () => {
      const multiItemOrder: TelegramOrderPayload = {
        ...baseOrder,
        items: [
          { productName: "Клавиатура", price: 5000, quantity: 2 },
          { productName: "Мышь", price: 3000, quantity: 1 },
        ],
        goodsTotal: 13000,
        deliveryCost: 0,
        totalAmount: 13000,
      };

      const message = formatOrderMessage(multiItemOrder);
      expect(message).toContain("1. <b>Клавиатура</b> — 2 шт.");
      expect(message).toContain("2. <b>Мышь</b> — 1 шт.");
    });

    it("should format pickup delivery without showing street/house/apartment", () => {
      const pickupOrder: TelegramOrderPayload = {
        ...baseOrder,
        deliveryMethod: "pickup",
        street: null,
        house: null,
        apartment: null,
      };

      const message = formatOrderMessage(pickupOrder);
      expect(message).toContain("🚚 <b>Способ доставки:</b> Самовывоз");
      expect(message).toContain("📍 <b>Пункт выдачи:</b> г. Москва");
      expect(message).not.toContain("ул.");
    });

    it("should omit comment line when comment is empty or null", () => {
      const noCommentOrder: TelegramOrderPayload = {
        ...baseOrder,
        comment: null,
      };

      const message = formatOrderMessage(noCommentOrder);
      expect(message).not.toContain("💬 <b>Комментарий:</b>");
    });

    it("should safely escape user-supplied HTML entities in all fields", () => {
      const xssOrder: TelegramOrderPayload = {
        ...baseOrder,
        customerName: "<b>Hacker</b> & Co",
        comment: "<script>alert(1)</script>",
        items: [
          {
            productName: "Монитор 27\" <4K & OLED>",
            price: 50000,
            quantity: 1,
          },
        ],
      };

      const message = formatOrderMessage(xssOrder);
      expect(message).toContain("&lt;b&gt;Hacker&lt;/b&gt; &amp; Co");
      expect(message).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
      expect(message).toContain("Монитор 27\" &lt;4K &amp; OLED&gt;");
      expect(message).not.toContain("<b>Hacker</b>");
    });
  });

  describe("sendOrderTelegramNotification", () => {
    const testOrder: TelegramOrderPayload = {
      orderNumber: "TG-TEST1",
      customerName: "Тестовый Покупатель",
      customerPhone: "+79990000000",
      customerEmail: "test@example.com",
      deliveryMethod: "pickup",
      city: "Москва",
      items: [{ productName: "Кабель Type-C", price: 500, quantity: 1 }],
      goodsTotal: 500,
      deliveryCost: 490,
      totalAmount: 990,
    };

    it("should successfully send request via fetch with parse_mode=HTML and chat_id", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ ok: true }),
      });
      globalThis.fetch = mockFetch;

      const result = await sendOrderTelegramNotification(testOrder);

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe(
        "https://api.telegram.org/botmock-bot-token-12345/sendMessage"
      );
      expect(options.method).toBe("POST");
      expect(options.headers["Content-Type"]).toBe("application/json");

      const body = JSON.parse(options.body);
      expect(body.chat_id).toBe("-1001234567890");
      expect(body.parse_mode).toBe("HTML");
      expect(body.text).toContain("TG-TEST1");
      expect(body.text).toContain("Тестовый Покупатель");
    });

    it("should return false and not call fetch when TELEGRAM_BOT_TOKEN is missing", async () => {
      delete process.env.TELEGRAM_BOT_TOKEN;
      const mockFetch = vi.fn();
      globalThis.fetch = mockFetch;

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = await sendOrderTelegramNotification(testOrder);

      expect(result).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
    });

    it("should return false and not call fetch when TELEGRAM_CHAT_ID is missing", async () => {
      delete process.env.TELEGRAM_CHAT_ID;
      const mockFetch = vi.fn();
      globalThis.fetch = mockFetch;

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = await sendOrderTelegramNotification(testOrder);

      expect(result).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
    });

    it("should handle 4xx error from Telegram API gracefully without throwing", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => '{"ok":false,"description":"Bad Request: chat not found"}',
      });
      globalThis.fetch = mockFetch;
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await sendOrderTelegramNotification(testOrder);

      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalled();
    });

    it("should handle 5xx error from Telegram API gracefully without throwing", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      });
      globalThis.fetch = mockFetch;
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await sendOrderTelegramNotification(testOrder);

      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalled();
    });

    it("should handle network exception (fetch rejection) gracefully without throwing", async () => {
      const mockFetch = vi
        .fn()
        .mockRejectedValue(new Error("Connection timeout / DNS error"));
      globalThis.fetch = mockFetch;
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await sendOrderTelegramNotification(testOrder);

      expect(result).toBe(false);
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
