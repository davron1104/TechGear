import { describe, it, expect, vi } from "vitest";
import React, { useState } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { CurrencyProvider, useCurrency } from "@/context/currency-context";
import { FilterState } from "@/types/product";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const mockFilters: FilterState = {
  categorySlug: null,
  minPrice: null,
  maxPrice: null,
  inStockOnly: false,
  sortBy: "popular",
};

function FilterTestHarness({
  initialCurrency = "UZS",
  initialFilters = mockFilters,
  exchangeRate = 12500,
}: {
  initialCurrency?: "UZS" | "USD";
  initialFilters?: FilterState;
  exchangeRate?: number;
}) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const { currency, setCurrency } = useCurrency();

  return (
    <div>
      <button data-testid="set-uzs" onClick={() => setCurrency("UZS")}>
        UZS
      </button>
      <button data-testid="set-usd" onClick={() => setCurrency("USD")}>
        USD
      </button>
      <span data-testid="current-currency">{currency}</span>
      <span data-testid="canonical-min">{filters.minPrice ?? "null"}</span>
      <span data-testid="canonical-max">{filters.maxPrice ?? "null"}</span>

      <CatalogFilters
        filters={filters}
        onFilterChange={(updater) => setFilters(updater)}
        onReset={() => setFilters(mockFilters)}
        totalFound={10}
      />
    </div>
  );
}

describe("CatalogFilters with Currency", () => {
  it("should display 'Цена (сум)' and UZS placeholders when currency is UZS", () => {
    render(
      <CurrencyProvider initialCurrency="UZS" initialExchangeRate={12500}>
        <CatalogFilters
          filters={mockFilters}
          onFilterChange={vi.fn()}
          onReset={vi.fn()}
          totalFound={10}
        />
      </CurrencyProvider>
    );

    expect(screen.getByText("Цена (сум)")).toBeDefined();
    expect(screen.getByPlaceholderText("До 10 000 000")).toBeDefined();
  });

  it("should display 'Цена ($)' and USD placeholders when currency is USD", () => {
    render(
      <CurrencyProvider initialCurrency="USD" initialExchangeRate={12500}>
        <CatalogFilters
          filters={mockFilters}
          onFilterChange={vi.fn()}
          onReset={vi.fn()}
          totalFound={10}
        />
      </CurrencyProvider>
    );

    expect(screen.getByText("Цена ($)")).toBeDefined();
    expect(screen.getByPlaceholderText("До 1 000")).toBeDefined();
  });

  it("scenario 1: UZS -> enter 1 000 000 -> switch to USD -> switch back to UZS without precision loss", () => {
    render(
      <CurrencyProvider initialCurrency="UZS" initialExchangeRate={12500}>
        <FilterTestHarness initialCurrency="UZS" />
      </CurrencyProvider>
    );

    const minInput = screen.getByPlaceholderText("От 0") as HTMLInputElement;

    // 1. Enter 1 000 000 in UZS
    fireEvent.change(minInput, { target: { value: "1000000" } });
    expect(screen.getByTestId("canonical-min").textContent).toBe("1000000");
    expect(minInput.value).toBe("1000000");

    // 2. Switch to USD (1 000 000 / 12500 = 80)
    fireEvent.click(screen.getByTestId("set-usd"));
    expect(minInput.value).toBe("80");
    expect(screen.getByTestId("canonical-min").textContent).toBe("1000000");

    // 3. Switch back to UZS (should be exact 1000000)
    fireEvent.click(screen.getByTestId("set-uzs"));
    expect(minInput.value).toBe("1000000");
    expect(screen.getByTestId("canonical-min").textContent).toBe("1000000");
  });

  it("scenario 2: USD -> enter $50.25 (decimal) -> switch to UZS -> switch back to USD", () => {
    render(
      <CurrencyProvider initialCurrency="USD" initialExchangeRate={12500}>
        <FilterTestHarness initialCurrency="USD" />
      </CurrencyProvider>
    );

    const minInput = screen.getByPlaceholderText("От 0") as HTMLInputElement;

    // 1. Enter decimal value in USD: 50.25
    fireEvent.change(minInput, { target: { value: "50.25" } });
    // Canonical UZS: 50.25 * 12500 = 628125
    expect(screen.getByTestId("canonical-min").textContent).toBe("628125");
    expect(minInput.value).toBe("50.25");

    // 2. Switch to UZS
    fireEvent.click(screen.getByTestId("set-uzs"));
    expect(minInput.value).toBe("628125");
    expect(screen.getByTestId("canonical-min").textContent).toBe("628125");

    // 3. Switch back to USD (should be exact 50.25)
    fireEvent.click(screen.getByTestId("set-usd"));
    expect(minInput.value).toBe("50.25");
    expect(screen.getByTestId("canonical-min").textContent).toBe("628125");
  });

  it("scenario 3: switching currency with empty filter remains empty", () => {
    render(
      <CurrencyProvider initialCurrency="UZS" initialExchangeRate={12500}>
        <FilterTestHarness initialCurrency="UZS" />
      </CurrencyProvider>
    );

    const minInput = screen.getByPlaceholderText("От 0") as HTMLInputElement;
    const maxInput = screen.getByPlaceholderText("До 10 000 000") as HTMLInputElement;

    expect(minInput.value).toBe("");
    expect(maxInput.value).toBe("");

    fireEvent.click(screen.getByTestId("set-usd"));
    expect(minInput.value).toBe("");
    expect(maxInput.value).toBe("");

    fireEvent.click(screen.getByTestId("set-uzs"));
    expect(minInput.value).toBe("");
    expect(maxInput.value).toBe("");
  });
});
