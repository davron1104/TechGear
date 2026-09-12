import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import nodemailer from "nodemailer";
import {
  getBaseAppUrl,
  getResetPasswordEmailContent,
  getMailTransporter,
  sendPasswordResetEmail,
} from "@/lib/mail";

vi.mock("nodemailer", () => {
  const sendMailMock = vi.fn().mockResolvedValue({ messageId: "mocked-id" });
  return {
    default: {
      createTransport: vi.fn(() => ({
        sendMail: sendMailMock,
      })),
    },
  };
});

describe("mail.ts utility functions", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getBaseAppUrl", () => {
    it("should return sanitized URL without trailing slashes", () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://techgear.uz/";
      expect(getBaseAppUrl()).toBe("https://techgear.uz");

      process.env.NEXT_PUBLIC_APP_URL = "https://techgear.uz///";
      expect(getBaseAppUrl()).toBe("https://techgear.uz");
    });

    it("should return localhost:3000 fallback if NEXT_PUBLIC_APP_URL is not set", () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      expect(getBaseAppUrl()).toBe("http://localhost:3000");
    });
  });

  describe("getResetPasswordEmailContent", () => {
    const resetLink = "https://techgear.uz/ru/reset-password?token=test-token";

    it("should return Russian content for 'ru'", () => {
      const content = getResetPasswordEmailContent(resetLink, "ru");
      expect(content.subject).toBe("TechGear: Сброс пароля");
      expect(content.html).toContain(resetLink);
      expect(content.html).toContain("Для сброса пароля");
    });

    it("should return Uzbek content for 'uz'", () => {
      const content = getResetPasswordEmailContent(resetLink, "uz");
      expect(content.subject).toBe("TechGear: Parolni tiklash");
      expect(content.html).toContain(resetLink);
      expect(content.html).toContain("Parolni tiklash uchun");
    });

    it("should return English content for 'en'", () => {
      const content = getResetPasswordEmailContent(resetLink, "en");
      expect(content.subject).toBe("TechGear: Password Reset");
      expect(content.html).toContain(resetLink);
      expect(content.html).toContain("To reset your password");
    });
  });

  describe("getMailTransporter", () => {
    it("should throw error if SMTP_HOST is missing", () => {
      delete process.env.SMTP_HOST;
      process.env.SMTP_USER = "user@techgear.uz";
      process.env.SMTP_PASSWORD = "password";

      expect(() => getMailTransporter()).toThrow("SMTP configuration is missing");
    });

    it("should throw error if SMTP_USER is missing", () => {
      process.env.SMTP_HOST = "smtp.yandex.ru";
      delete process.env.SMTP_USER;
      process.env.SMTP_PASSWORD = "password";

      expect(() => getMailTransporter()).toThrow("SMTP configuration is missing");
    });

    it("should throw error if SMTP_PASSWORD is missing", () => {
      process.env.SMTP_HOST = "smtp.yandex.ru";
      process.env.SMTP_USER = "user@techgear.uz";
      delete process.env.SMTP_PASSWORD;

      expect(() => getMailTransporter()).toThrow("SMTP configuration is missing");
    });

    it("should create transport with secure: true for port 465", () => {
      process.env.SMTP_HOST = "smtp.yandex.ru";
      process.env.SMTP_USER = "user@techgear.uz";
      process.env.SMTP_PASSWORD = "password";
      process.env.SMTP_PORT = "465";

      getMailTransporter();

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: "smtp.yandex.ru",
          port: 465,
          secure: true,
          auth: {
            user: "user@techgear.uz",
            pass: "password",
          },
        })
      );
    });

    it("should create transport with secure: false for port 587", () => {
      process.env.SMTP_HOST = "smtp.yandex.ru";
      process.env.SMTP_USER = "user@techgear.uz";
      process.env.SMTP_PASSWORD = "password";
      process.env.SMTP_PORT = "587";

      getMailTransporter();

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: "smtp.yandex.ru",
          port: 587,
          secure: false,
          auth: {
            user: "user@techgear.uz",
            pass: "password",
          },
        })
      );
    });
  });

  describe("sendPasswordResetEmail", () => {
    it("should construct localized URL and call sendMail", async () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://techgear.uz";
      process.env.SMTP_HOST = "smtp.yandex.ru";
      process.env.SMTP_USER = "user@techgear.uz";
      process.env.SMTP_PASSWORD = "password";
      process.env.EMAIL_FROM = "TechGear <noreply@techgear.uz>";

      const transportInstance = {
        sendMail: vi.fn().mockResolvedValue({ messageId: "123" }),
      };
      vi.mocked(nodemailer.createTransport).mockReturnValue(transportInstance as unknown as ReturnType<typeof nodemailer.createTransport>);

      await sendPasswordResetEmail("customer@example.com", "raw-token-123", "uz");

      expect(transportInstance.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "TechGear <noreply@techgear.uz>",
          to: "customer@example.com",
          subject: "TechGear: Parolni tiklash",
          html: expect.stringContaining("https://techgear.uz/uz/reset-password?token=raw-token-123"),
        })
      );
    });
  });
});
