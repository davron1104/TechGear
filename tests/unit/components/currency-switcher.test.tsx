import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CurrencyProvider, useCurrency } from "@/context/currency-context";
import { CurrencySwitcher } from "@/components/layout/currency-switcher";
import { CURRENCY_COOKIE_NAME } from "@/lib/currency";

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Test helper component to inspect useCurrency hook values
function CurrencyConsumer() {
  const { currency, exchangeRate, formatPrice, isPending } = useCurrency();
  return (
    <div>
      <span data-testid="current-currency">{currency}</span>
      <span data-testid="exchange-rate">{exchangeRate}</span>
      <span data-testid="formatted-price">{formatPrice(1250000)}</span>
      <span data-testid="pending-state">{String(isPending)}</span>
      <CurrencySwitcher />
    </div>
  );
}

describe("CurrencyContext and CurrencySwitcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.cookie = "";
  });

  it("should initialize with default currency UZS and custom exchange rate", () => {
    render(
      <CurrencyProvider initialCurrency="UZS" initialExchangeRate={12500}>
        <CurrencyConsumer />
      </CurrencyProvider>
    );

    expect(screen.getByTestId("current-currency").textContent).toBe("UZS");
    expect(screen.getByTestId("exchange-rate").textContent).toBe("12500");
    expect(screen.getByTestId("formatted-price").textContent).toContain("1 250 000");
    expect(screen.getByTestId("formatted-price").textContent).toContain("сум");
  });

  it("should initialize with USD if provided from server cookie", () => {
    render(
      <CurrencyProvider initialCurrency="USD" initialExchangeRate={12500}>
        <CurrencyConsumer />
      </CurrencyProvider>
    );

    expect(screen.getByTestId("current-currency").textContent).toBe("USD");
    expect(screen.getByTestId("formatted-price").textContent).toBe("$100");
  });

  it("should switch to USD on button click, update cookie and call router.refresh", async () => {
    render(
      <CurrencyProvider initialCurrency="UZS" initialExchangeRate={12500}>
        <CurrencyConsumer />
      </CurrencyProvider>
    );

    const usdButton = screen.getByRole("button", { name: "USD" });
    expect(usdButton.getAttribute("aria-pressed")).toBe("false");

    await act(async () => {
      fireEvent.click(usdButton);
    });

    expect(screen.getByTestId("current-currency").textContent).toBe("USD");
    expect(screen.getByTestId("formatted-price").textContent).toBe("$100");
    expect(usdButton.getAttribute("aria-pressed")).toBe("true");

    // Verify cookie was set
    expect(document.cookie).toContain(`${CURRENCY_COOKIE_NAME}=USD`);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("should switch back to UZS on button click", async () => {
    render(
      <CurrencyProvider initialCurrency="USD" initialExchangeRate={12500}>
        <CurrencyConsumer />
      </CurrencyProvider>
    );

    const uzsButton = screen.getByRole("button", { name: "UZS" });
    expect(uzsButton.getAttribute("aria-pressed")).toBe("false");

    await act(async () => {
      fireEvent.click(uzsButton);
    });

    expect(screen.getByTestId("current-currency").textContent).toBe("UZS");
    expect(screen.getByTestId("formatted-price").textContent).toContain("1 250 000");
    expect(uzsButton.getAttribute("aria-pressed")).toBe("true");
    expect(document.cookie).toContain(`${CURRENCY_COOKIE_NAME}=UZS`);
  });

  it("should safely provide fallback values when useCurrency is used outside provider", () => {
    render(<CurrencyConsumer />);

    expect(screen.getByTestId("current-currency").textContent).toBe("UZS");
    expect(screen.getByTestId("formatted-price").textContent).toContain("1 250 000 сум");
  });
});
