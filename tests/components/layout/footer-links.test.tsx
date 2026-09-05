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

  it("should render contact information from ShopSettings", () => {
    renderFooterWithProviders("ru");

    expect(screen.getByText(DEFAULT_SHOP_SETTINGS.phone)).toBeInTheDocument();
    expect(screen.getByText(DEFAULT_SHOP_SETTINGS.email)).toBeInTheDocument();
    expect(screen.getByText(DEFAULT_SHOP_SETTINGS.address)).toBeInTheDocument();
  });
});
