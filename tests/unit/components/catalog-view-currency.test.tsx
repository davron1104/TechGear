import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CatalogView } from "@/components/catalog/catalog-view";
import { CurrencyProvider, useCurrency } from "@/context/currency-context";
import { Product } from "@/types/product";

vi.mock("@/actions/cart-actions", () => ({
  getCart: vi.fn().mockResolvedValue({ success: true, data: [] }),
  addToCart: vi.fn().mockResolvedValue({ success: true }),
  updateCartItemQuantity: vi.fn().mockResolvedValue({ success: true }),
  removeFromCart: vi.fn().mockResolvedValue({ success: true }),
  clearServerCart: vi.fn().mockResolvedValue({ success: true }),
  mergeCart: vi.fn().mockResolvedValue({ success: true, data: [] }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const mockProducts: Product[] = [
  {
    id: "p1",
    name: "Mouse Basic",
    slug: "mouse-basic",
    categoryId: "c1",
    categorySlug: "mice",
    categoryName: "Мыши",
    price: 500000, // 500 000 сум ($40 при курсе 12500)
    image: "/img1.jpg",
    images: ["/img1.jpg"],
    shortDescription: "Basic mouse",
    description: "Full description",
    stock: 10,
    brand: "BrandA",
    characteristics: {},
    isPopular: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "p2",
    name: "Keyboard Pro",
    slug: "keyboard-pro",
    categoryId: "c2",
    categorySlug: "keyboards",
    categoryName: "Клавиатуры",
    price: 1500000, // 1 500 000 сум ($120 при курсе 12500)
    image: "/img2.jpg",
    images: ["/img2.jpg"],
    shortDescription: "Pro keyboard",
    description: "Full description",
    stock: 5,
    brand: "BrandB",
    characteristics: {},
    isPopular: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "p3",
    name: "Monitor Elite",
    slug: "monitor-elite",
    categoryId: "c3",
    categorySlug: "monitors",
    categoryName: "Мониторы",
    price: 5000000, // 5 000 000 сум ($400 при курсе 12500)
    image: "/img3.jpg",
    images: ["/img3.jpg"],
    shortDescription: "Elite monitor",
    description: "Full description",
    stock: 2,
    brand: "BrandC",
    characteristics: {},
    isPopular: false,
    createdAt: new Date().toISOString(),
  },
];

function CatalogViewTestHarness({
  initialCurrency = "UZS",
  initialExchangeRate = 12500,
}: {
  initialCurrency?: "UZS" | "USD";
  initialExchangeRate?: number;
}) {
  const { setCurrency, currency } = useCurrency();

  return (
    <div>
      <div className="flex gap-2">
        <button data-testid="set-uzs" onClick={() => setCurrency("UZS")}>
          Set UZS
        </button>
        <button data-testid="set-usd" onClick={() => setCurrency("USD")}>
          Set USD
        </button>
        <span data-testid="active-currency">{currency}</span>
      </div>
      <CatalogView products={mockProducts} />
    </div>
  );
}

describe("CatalogView Currency & Price Range Filtering", () => {
  it("filters products correctly with canonical minPrice in UZS", () => {
    render(
      <CurrencyProvider initialCurrency="UZS" initialExchangeRate={12500}>
        <CatalogViewTestHarness initialCurrency="UZS" />
      </CurrencyProvider>
    );

    expect(screen.getByText("Mouse Basic")).toBeDefined();
    expect(screen.getByText("Keyboard Pro")).toBeDefined();
    expect(screen.getByText("Monitor Elite")).toBeDefined();

    // Filter minPrice: 1 000 000 сум (should exclude Mouse Basic at 500k)
    const minInput = screen.getByPlaceholderText("От 0");
    fireEvent.change(minInput, { target: { value: "1000000" } });

    expect(screen.queryByText("Mouse Basic")).toBeNull();
    expect(screen.getByText("Keyboard Pro")).toBeDefined();
    expect(screen.getByText("Monitor Elite")).toBeDefined();
  });

  it("filters products correctly with canonical maxPrice in USD", () => {
    render(
      <CurrencyProvider initialCurrency="USD" initialExchangeRate={12500}>
        <CatalogViewTestHarness initialCurrency="USD" />
      </CurrencyProvider>
    );

    // In USD, 100 USD = 1 250 000 сум (should keep Mouse at $40, exclude Keyboard at $120 and Monitor at $400)
    const maxInput = screen.getByPlaceholderText("До 1 000");
    fireEvent.change(maxInput, { target: { value: "100" } });

    expect(screen.getByText("Mouse Basic")).toBeDefined();
    expect(screen.queryByText("Keyboard Pro")).toBeNull();
    expect(screen.queryByText("Monitor Elite")).toBeNull();
  });

  it("maintains consistent filtering across UZS -> USD -> UZS toggles without intermediate flash", () => {
    render(
      <CurrencyProvider initialCurrency="UZS" initialExchangeRate={12500}>
        <CatalogViewTestHarness initialCurrency="UZS" />
      </CurrencyProvider>
    );

    // Set min: 1 000 000 сум, max: 2 000 000 сум (only Keyboard Pro at 1.5M matches)
    const minInput = screen.getByPlaceholderText("От 0");
    const maxInput = screen.getByPlaceholderText("До 10 000 000");

    fireEvent.change(minInput, { target: { value: "1000000" } });
    fireEvent.change(maxInput, { target: { value: "2000000" } });

    expect(screen.queryByText("Mouse Basic")).toBeNull();
    expect(screen.getByText("Keyboard Pro")).toBeDefined();
    expect(screen.queryByText("Monitor Elite")).toBeNull();

    // Switch to USD: Keyboard Pro should STILL be the only matched product
    fireEvent.click(screen.getByTestId("set-usd"));
    expect(screen.queryByText("Mouse Basic")).toBeNull();
    expect(screen.getByText("Keyboard Pro")).toBeDefined();
    expect(screen.queryByText("Monitor Elite")).toBeNull();

    // Switch back to UZS: Keyboard Pro should STILL be the only matched product
    fireEvent.click(screen.getByTestId("set-uzs"));
    expect(screen.queryByText("Mouse Basic")).toBeNull();
    expect(screen.getByText("Keyboard Pro")).toBeDefined();
    expect(screen.queryByText("Monitor Elite")).toBeNull();
  });
});
