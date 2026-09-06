import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Header } from "@/components/layout/header";
import { CategoryBar } from "@/components/layout/category-bar";
import { LanguageProvider } from "@/context/language-context";
import { CurrencyProvider } from "@/context/currency-context";
import { DEFAULT_SHOP_SETTINGS } from "@/lib/settings";
import { DEFAULT_CATEGORIES } from "@/types/category";

const mockUseSession = vi.fn<() => any>(() => ({ data: null, status: "unauthenticated" }));

vi.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/ru",
  useSearchParams: () => new URLSearchParams(),
}));

function renderLayout(locale: "ru" | "uz" | "en" = "ru") {
  return render(
    <LanguageProvider initialLocale={locale}>
      <CurrencyProvider initialCurrency="UZS">
        <Header shopSettings={DEFAULT_SHOP_SETTINGS} categories={DEFAULT_CATEGORIES} />
        <CategoryBar categories={DEFAULT_CATEGORIES} />
      </CurrencyProvider>
    </LanguageProvider>
  );
}

describe("Responsive Navigation (Header, Burger Drawer, CategoryBar)", () => {
  it("CategoryBar should have hidden lg:block class to stay hidden on mobile and tablet", () => {
    const { container } = renderLayout();
    const nav = container.querySelector("nav");
    expect(nav).toHaveClass("hidden");
    expect(nav).toHaveClass("lg:block");
  });

  it("Header should render Burger button with lg:hidden and aria attributes", () => {
    renderLayout();
    const burgerBtn = screen.getByRole("button", { name: "Категории каталога" });
    expect(burgerBtn).toBeInTheDocument();
    expect(burgerBtn).toHaveClass("lg:hidden");
    expect(burgerBtn.getAttribute("aria-expanded")).toBe("false");
  });

  it("should open Burger Drawer when Burger button is clicked and show Catalog and Customer links", () => {
    renderLayout();
    const burgerBtn = screen.getByRole("button", { name: "Категории каталога" });
    fireEvent.click(burgerBtn);

    expect(burgerBtn.getAttribute("aria-expanded")).toBe("true");

    const drawer = document.getElementById("mobile-navigation-drawer");
    expect(drawer).toBeInTheDocument();
    expect(drawer).toHaveClass("z-[60]");
    expect(drawer).toHaveClass("visible");

    // Check Catalog section links
    expect(screen.getAllByText("Все товары").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Клавиатуры").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Мыши").length).toBeGreaterThan(0);

    // Check Customers section links
    expect(screen.getByText("Войти / Регистрация")).toBeInTheDocument();
    expect(screen.getByText("Доставка и оплата")).toBeInTheDocument();
    expect(screen.getByText("Гарантия и сервис")).toBeInTheDocument();
  });

  it("should close Burger Drawer when close button or overlay is clicked", () => {
    renderLayout();
    const burgerBtn = screen.getByRole("button", { name: "Категории каталога" });
    fireEvent.click(burgerBtn);

    const closeBtn = screen.getByRole("button", { name: "Отмена" });
    fireEvent.click(closeBtn);

    const drawer = document.getElementById("mobile-navigation-drawer");
    expect(drawer).toHaveClass("invisible");
  });

  it("should toggle mobile search input when mobile search button is clicked", () => {
    renderLayout();
    const searchToggleBtn = screen.getByRole("button", { name: "Поиск по сайту" });
    expect(searchToggleBtn).toHaveClass("md:hidden");

    // Initially mobile search row is not rendered (only 1 desktop search input)
    expect(searchToggleBtn.getAttribute("aria-expanded")).toBe("false");
    expect(screen.getAllByPlaceholderText("Поиск товаров, брендов и категорий...").length).toBe(1);

    // Click to open (now 2 search inputs: desktop + mobile dropdown)
    fireEvent.click(searchToggleBtn);
    expect(searchToggleBtn.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getAllByPlaceholderText("Поиск товаров, брендов и категорий...").length).toBe(2);

    // Click to close
    fireEvent.click(searchToggleBtn);
    expect(searchToggleBtn.getAttribute("aria-expanded")).toBe("false");
    expect(screen.getAllByPlaceholderText("Поиск товаров, брендов и категорий...").length).toBe(1);
  });

  it("should display localized adminRole for ADMIN on RU, UZ, and EN", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "1", name: "Администратор TechGear", email: "admin@techgear.ru", role: "ADMIN" },
        expires: "2099-01-01",
      },
      status: "authenticated",
    });

    // 1. RU
    const { unmount: unmountRu } = renderLayout("ru");
    const burgerBtnRu = screen.getByRole("button", { name: "Категории каталога" });
    fireEvent.click(burgerBtnRu);
    expect(screen.getAllByText("Администратор TechGear").length).toBeGreaterThanOrEqual(1);
    unmountRu();

    // 2. UZ
    const { unmount: unmountUz } = renderLayout("uz");
    const burgerBtnUz = screen.getByRole("button", { name: "Katalog toifalari" });
    fireEvent.click(burgerBtnUz);
    expect(screen.getAllByText("Administrator TechGear").length).toBeGreaterThanOrEqual(1);
    unmountUz();

    // 3. EN
    const { unmount: unmountEn } = renderLayout("en");
    const burgerBtnEn = screen.getByRole("button", { name: "Catalog Categories" });
    fireEvent.click(burgerBtnEn);
    expect(screen.getAllByText("TechGear Administrator").length).toBeGreaterThanOrEqual(1);
    unmountEn();
  });

  it("should display exact User.name for CUSTOMER and fallback to profile if name is missing", () => {
    // 1. Customer with real name
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "2", name: "Иван Иванов", email: "customer@techgear.ru", role: "CUSTOMER" },
        expires: "2099-01-01",
      },
      status: "authenticated",
    });

    const { unmount: unmountCustomer } = renderLayout("uz");
    const burgerBtn = screen.getByRole("button", { name: "Katalog toifalari" });
    fireEvent.click(burgerBtn);
    expect(screen.getAllByText("Иван Иванов").length).toBeGreaterThanOrEqual(1);
    unmountCustomer();

    // 2. Customer without name (fallback to t("nav.profile"))
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "3", name: "", email: "noname@techgear.ru", role: "CUSTOMER" },
        expires: "2099-01-01",
      },
      status: "authenticated",
    });

    const { unmount: unmountFallback } = renderLayout("uz");
    const burgerBtnFallback = screen.getByRole("button", { name: "Katalog toifalari" });
    fireEvent.click(burgerBtnFallback);
    expect(screen.getAllByText("Profil").length).toBeGreaterThanOrEqual(1);
    unmountFallback();
  });
});
