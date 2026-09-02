import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { LanguageProvider, useLanguage } from "@/context/language-context";
import { LOCALE_COOKIE_NAME } from "@/i18n";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/ru",
  useSearchParams: () => new URLSearchParams(),
}));

function LanguageTestConsumer() {
  const { locale, t } = useLanguage();
  return (
    <div>
      <span data-testid="current-locale">{locale}</span>
      <span data-testid="translated-cart">{t("cart.title")}</span>
      <span data-testid="translated-catalog">{t("catalog.title")}</span>
    </div>
  );
}

describe("LanguageSwitcher & LanguageContext", () => {
  beforeEach(() => {
    // Clear cookies before each test
    document.cookie = `${LOCALE_COOKIE_NAME}=; max-age=0`;
  });

  it("should initialize with default locale 'ru'", () => {
    render(
      <LanguageProvider initialLocale="ru">
        <LanguageSwitcher />
        <LanguageTestConsumer />
      </LanguageProvider>
    );

    expect(screen.getByTestId("current-locale").textContent).toBe("ru");
    expect(screen.getByTestId("translated-cart").textContent).toBe("Корзина");
    expect(screen.getByTestId("translated-catalog").textContent).toBe("Каталог товаров");

    const ruBtn = screen.getByRole("button", { name: "RU" });
    const uzBtn = screen.getByRole("button", { name: "UZ" });
    const enBtn = screen.getByRole("button", { name: "EN" });

    expect(ruBtn.getAttribute("aria-pressed")).toBe("true");
    expect(uzBtn.getAttribute("aria-pressed")).toBe("false");
    expect(enBtn.getAttribute("aria-pressed")).toBe("false");
  });

  it("should switch from ru to uz and update cookie, state and translation", () => {
    render(
      <LanguageProvider initialLocale="ru">
        <LanguageSwitcher />
        <LanguageTestConsumer />
      </LanguageProvider>
    );

    const uzBtn = screen.getByRole("button", { name: "UZ" });
    fireEvent.click(uzBtn);

    expect(screen.getByTestId("current-locale").textContent).toBe("uz");
    expect(screen.getByTestId("translated-cart").textContent).toBe("Savat");
    expect(screen.getByTestId("translated-catalog").textContent).toBe("Mahsulotlar katalogi");
    expect(uzBtn.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "RU" }).getAttribute("aria-pressed")).toBe("false");

    expect(document.cookie).toContain(`${LOCALE_COOKIE_NAME}=uz`);
  });

  it("should switch from uz to en and update cookie, state and translation", () => {
    render(
      <LanguageProvider initialLocale="uz">
        <LanguageSwitcher />
        <LanguageTestConsumer />
      </LanguageProvider>
    );

    const enBtn = screen.getByRole("button", { name: "EN" });
    fireEvent.click(enBtn);

    expect(screen.getByTestId("current-locale").textContent).toBe("en");
    expect(screen.getByTestId("translated-cart").textContent).toBe("Shopping Cart");
    expect(screen.getByTestId("translated-catalog").textContent).toBe("Product Catalog");
    expect(enBtn.getAttribute("aria-pressed")).toBe("true");

    expect(document.cookie).toContain(`${LOCALE_COOKIE_NAME}=en`);
  });

  it("should fallback to Russian when a key is missing in target locale", () => {
    render(
      <LanguageProvider initialLocale="uz">
        <LanguageTestConsumer />
      </LanguageProvider>
    );

    // Common brand or general keys present across dictionaries
    expect(screen.getByTestId("translated-cart").textContent).toBe("Savat");
  });
});
