import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Header } from "@/components/layout/header";
import { LanguageProvider } from "@/context/language-context";
import { CurrencyProvider } from "@/context/currency-context";
import { DEFAULT_SHOP_SETTINGS, ShopSettings } from "@/lib/settings";

function renderHeader(shopSettings: ShopSettings) {
  return render(
    <LanguageProvider initialLocale="ru">
      <CurrencyProvider initialCurrency="UZS">
        <Header shopSettings={shopSettings} />
      </CurrencyProvider>
    </LanguageProvider>
  );
}

describe("Header Sticky Top Bar Behavior", () => {
  it("should NOT have sticky classes on top bar when stickyTopBar is false (default)", () => {
    const { container } = renderHeader(DEFAULT_SHOP_SETTINGS);

    // Find the top info bar (contains phone number link)
    const phoneLink = screen.getAllByText(DEFAULT_SHOP_SETTINGS.phone)[0];
    const topBar = phoneLink.closest(".bg-\\[\\#0F172A\\]");

    expect(topBar).toBeInTheDocument();
    expect(topBar).not.toHaveClass("sticky");
    expect(topBar).not.toHaveClass("top-0");
    expect(topBar).not.toHaveClass("z-50");

    // Header element itself should NOT be sticky
    const headerElement = container.querySelector("header");
    expect(headerElement).not.toHaveClass("sticky");
  });

  it("should have sticky top-0 z-50 shadow-md classes ONLY on top bar when stickyTopBar is true", () => {
    const stickySettings: ShopSettings = {
      ...DEFAULT_SHOP_SETTINGS,
      stickyTopBar: true,
    };

    const { container } = renderHeader(stickySettings);

    const phoneLink = screen.getAllByText(stickySettings.phone)[0];
    const topBar = phoneLink.closest(".bg-\\[\\#0F172A\\]");

    expect(topBar).toBeInTheDocument();
    expect(topBar).toHaveClass("sticky");
    expect(topBar).toHaveClass("top-0");
    expect(topBar).toHaveClass("z-50");
    expect(topBar).toHaveClass("shadow-md");

    // Header element itself should NOT be sticky
    const headerElement = container.querySelector("header");
    expect(headerElement).not.toHaveClass("sticky");
  });
});
