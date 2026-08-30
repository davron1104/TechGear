import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { CurrencyProvider } from "@/context/currency-context";
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

  it("should call onFilterChange when entering price values", () => {
    const handleFilterChange = vi.fn();

    render(
      <CurrencyProvider initialCurrency="USD" initialExchangeRate={12500}>
        <CatalogFilters
          filters={mockFilters}
          onFilterChange={handleFilterChange}
          onReset={vi.fn()}
          totalFound={10}
        />
      </CurrencyProvider>
    );

    const minInput = screen.getByPlaceholderText("От 0");
    fireEvent.change(minInput, { target: { value: "50" } });

    expect(handleFilterChange).toHaveBeenCalled();
  });
});
