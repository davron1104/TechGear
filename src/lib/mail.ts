import nodemailer from "nodemailer";
import { DEFAULT_LOCALE, isValidLocale, Locale } from "@/i18n";

export interface MailContent {
  subject: string;
  html: string;
}

export function getBaseAppUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }
  return "http://localhost:3000";
}

export function getResetPasswordEmailContent(resetLink: string, locale: Locale): MailContent {
  switch (locale) {
    case "uz":
      return {
        subject: "TechGear: Parolni tiklash",
        html: `<p>Parolni tiklash uchun quyidagi havolaga o'ting: <a href="${resetLink}">${resetLink}</a></p>
               <p>Havola 1 soat davomida amal qiladi.</p>`,
      };
    case "en":
      return {
        subject: "TechGear: Password Reset",
        html: `<p>To reset your password, follow this link: <a href="${resetLink}">${resetLink}</a></p>
               <p>The link is valid for 1 hour.</p>`,
      };
    case "ru":
    default:
      return {
        subject: "TechGear: Сброс пароля",
        html: `<p>Для сброса пароля перейдите по следующей ссылке: <a href="${resetLink}">${resetLink}</a></p>
               <p>Ссылка действительна в течение 1 часа.</p>`,
      };
  }
}

export function getMailTransporter() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD?.trim();
  const rawPort = process.env.SMTP_PORT?.trim();
  const port = Number(rawPort) || 587;
  const secure = rawPort === "465";

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP configuration is missing required environment variables (SMTP_HOST, SMTP_USER, SMTP_PASSWORD)"
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  rawLocale: string = DEFAULT_LOCALE
) {
  const locale: Locale = isValidLocale(rawLocale) ? (rawLocale as Locale) : DEFAULT_LOCALE;
  const baseUrl = getBaseAppUrl();
  const resetLink = `${baseUrl}/${locale}/reset-password?token=${token}`;
  const transporter = getMailTransporter();
  const { subject, html } = getResetPasswordEmailContent(resetLink, locale);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "TechGear <noreply@techgear.uz>",
    to: email,
    subject,
    html,
  });
}

