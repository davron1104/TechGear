import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Footer } from "@/components/layout/footer";
import { LanguageProvider } from "@/context/language-context";
import { CurrencyProvider } from "@/context/currency-context";
import { DEFAULT_SHOP_SETTINGS } from "@/lib/settings";

function renderFooterWithProviders(locale: "ru" | "uz" | "en") {
  return render(
    <LanguageProvider initialLocale={locale}>
      <CurrencyProvider initialCurrency="UZS">
        <Footer shopSettings={DEFAULT_SHOP_SETTINGS} />
      </CurrencyProvider>
    </LanguageProvider>
  );
}

describe("Footer Navigation Links", () => {
  it("should render active delivery and warranty links for Russian locale", () => {
    renderFooterWithProviders("ru");

    const deliveryLink = screen.getByRole("link", { name: /Доставка и оплата/i });
    expect(deliveryLink).toBeInTheDocument();
    expect(deliveryLink).toHaveAttribute("href", "/ru/delivery");

    const warrantyLink = screen.getByRole("link", { name: /Гарантия и сервис/i });
    expect(warrantyLink).toBeInTheDocument();
    expect(warrantyLink).toHaveAttribute("href", "/ru/warranty");
  });

  it("should render active delivery and warranty links for Uzbek locale", () => {
    renderFooterWithProviders("uz");

    const deliveryLink = screen.getByRole("link", { name: /Yetkazib berish va to'lov/i });
    expect(deliveryLink).toBeInTheDocument();
    expect(deliveryLink).toHaveAttribute("href", "/uz/delivery");

    const warrantyLink = screen.getByRole("link", { name: /Kafolat va servis/i });
    expect(warrantyLink).toBeInTheDocument();
    expect(warrantyLink).toHaveAttribute("href", "/uz/warranty");
  });

  it("should render active delivery and warranty links for English locale", () => {
    renderFooterWithProviders("en");

    const deliveryLink = screen.getByRole("link", { name: /Delivery & Payment/i });
    expect(deliveryLink).toBeInTheDocument();
    expect(deliveryLink).toHaveAttribute("href", "/en/delivery");

    const warrantyLink = screen.getByRole("link", { name: /Warranty & Service/i });
    expect(warrantyLink).toBeInTheDocument();
    expect(warrantyLink).toHaveAttribute("href", "/en/warranty");
  });

  it("should render localized default contact information for Russian locale", () => {
    renderFooterWithProviders("ru");

    expect(screen.getByText(DEFAULT_SHOP_SETTINGS.phone)).toBeInTheDocument();
    expect(screen.getByText(DEFAULT_SHOP_SETTINGS.email)).toBeInTheDocument();
    expect(screen.getByText("Пн–Вс: 09:00 – 21:00")).toBeInTheDocument();
    expect(screen.getByText("г. Ташкент, ул. Амира Темура, д. 42")).toBeInTheDocument();
  });

  it("should render localized default contact information for Uzbek locale", () => {
    renderFooterWithProviders("uz");

    expect(screen.getByText(DEFAULT_SHOP_SETTINGS.phone)).toBeInTheDocument();
    expect(screen.getByText(DEFAULT_SHOP_SETTINGS.email)).toBeInTheDocument();
    expect(screen.getByText("Dush–Yak: 09:00 – 21:00")).toBeInTheDocument();
    expect(screen.getByText("Toshkent sh., Amir Temur ko'ch., 42-uy")).toBeInTheDocument();
  });

  it("should render localized default contact information for English locale", () => {
    renderFooterWithProviders("en");

    expect(screen.getByText(DEFAULT_SHOP_SETTINGS.phone)).toBeInTheDocument();
    expect(screen.getByText(DEFAULT_SHOP_SETTINGS.email)).toBeInTheDocument();
    expect(screen.getByText("Mon–Sun: 09:00 – 21:00")).toBeInTheDocument();
    expect(screen.getByText("42 Amir Temur St., Tashkent")).toBeInTheDocument();
  });

  it("should render custom multilingual admin settings correctly per locale", () => {
    const customSettings = {
      ...DEFAULT_SHOP_SETTINGS,
      address: {
        ru: "г. Самарканд, пл. Регистан, 1",
        uz: "Samarqand sh., Registon maydoni, 1",
        en: "1 Registan Square, Samarkand",
      },
      workingHours: {
        ru: "Пн-Пт: 10:00 - 18:00",
        uz: "Dush-Juma: 10:00 - 18:00",
        en: "Mon-Fri: 10:00 - 18:00",
      },
    };

    const { unmount: unmountEn } = render(
      <LanguageProvider initialLocale="en">
        <CurrencyProvider initialCurrency="USD">
          <Footer shopSettings={customSettings} />
        </CurrencyProvider>
      </LanguageProvider>
    );

    expect(screen.getByText("1 Registan Square, Samarkand")).toBeInTheDocument();
    expect(screen.getByText("Mon-Fri: 10:00 - 18:00")).toBeInTheDocument();
    unmountEn();

    render(
      <LanguageProvider initialLocale="uz">
        <CurrencyProvider initialCurrency="UZS">
          <Footer shopSettings={customSettings} />
        </CurrencyProvider>
      </LanguageProvider>
    );

    expect(screen.getByText("Samarqand sh., Registon maydoni, 1")).toBeInTheDocument();
    expect(screen.getByText("Dush-Juma: 10:00 - 18:00")).toBeInTheDocument();
  });

  it("should render legacy string admin settings as fallback across locales", () => {
    const legacySettings = {
      ...DEFAULT_SHOP_SETTINGS,
      address: "г. Бухара, ул. Бахауддина Накшбанди, 5" as unknown as typeof DEFAULT_SHOP_SETTINGS.address,
      workingHours: "09:00 - 21:00" as unknown as typeof DEFAULT_SHOP_SETTINGS.workingHours,
    };

    render(
      <LanguageProvider initialLocale="en">
        <CurrencyProvider initialCurrency="USD">
          <Footer shopSettings={legacySettings} />
        </CurrencyProvider>
      </LanguageProvider>
    );

    expect(screen.getByText("г. Бухара, ул. Бахауддина Накшбанди, 5")).toBeInTheDocument();
    expect(screen.getByText("09:00 - 21:00")).toBeInTheDocument();
  });
});
