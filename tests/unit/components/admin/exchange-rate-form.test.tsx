import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ExchangeRateForm } from "@/components/admin/settings/exchange-rate-form";
import * as settingsActions from "@/actions/settings-actions";

vi.mock("@/actions/settings-actions", () => ({
  updateExchangeRate: vi.fn(),
  refreshExchangeRateFromCbu: vi.fn(),
  getAdminExchangeRate: vi.fn(),
  getAdminExchangeRateDetails: vi.fn(),
}));

describe("ExchangeRateForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with initial exchange rate, source and timestamp", () => {
    render(
      <ExchangeRateForm
        initialRate={12500}
        initialUpdatedAt="2026-08-31T12:00:00.000Z"
        initialSource="Центральный банк РУз (cbu.uz)"
      />
    );

    expect(screen.getByText("1 USD = 12 500 сум")).toBeDefined();
    expect(screen.getByText("Центральный банк РУз (cbu.uz)")).toBeDefined();
    const input = screen.getByLabelText(/Курс доллара/i) as HTMLInputElement;
    expect(input.value).toBe("12500");
  });

  it("triggers CBU synchronization when clicking 'Обновить из ЦБ РУз'", async () => {
    vi.mocked(settingsActions.refreshExchangeRateFromCbu).mockResolvedValueOnce({
      success: true,
      data: {
        exchangeRate: 12850,
        updatedAt: "2026-08-31T15:30:00.000Z",
        source: "Центральный банк РУз (cbu.uz)",
      },
    });

    render(<ExchangeRateForm initialRate={12500} />);

    const syncBtn = screen.getByRole("button", { name: /Обновить курс из ЦБ РУз/i });
    fireEvent.click(syncBtn);

    await waitFor(() => {
      expect(settingsActions.refreshExchangeRateFromCbu).toHaveBeenCalled();
    });

    expect(
      await screen.findByText("Курс успешно обновлен из ЦБ РУз: 1 USD = 12 850 сум")
    ).toBeDefined();
    expect(screen.getByText("1 USD = 12 850 сум")).toBeDefined();
  });

  it("displays error message if CBU synchronization fails", async () => {
    vi.mocked(settingsActions.refreshExchangeRateFromCbu).mockResolvedValueOnce({
      success: false,
      error: "Сервер ЦБ РУз временно недоступен",
    });

    render(<ExchangeRateForm initialRate={12500} />);

    const syncBtn = screen.getByRole("button", { name: /Обновить курс из ЦБ РУз/i });
    fireEvent.click(syncBtn);

    expect(
      await screen.findByText("Сервер ЦБ РУз временно недоступен")
    ).toBeDefined();
  });

  it("shows error for manual rate lower than 1000", async () => {
    render(<ExchangeRateForm initialRate={12500} />);

    const input = screen.getByLabelText(/Курс доллара/i);
    fireEvent.change(input, { target: { value: "900" } });

    const submitBtn = screen.getByRole("button", { name: /Сохранить вручную/i });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText("Курс USD не может быть меньше 1 000 сум.")
    ).toBeDefined();
    expect(settingsActions.updateExchangeRate).not.toHaveBeenCalled();
  });

  it("shows error for manual rate higher than 100000", async () => {
    render(<ExchangeRateForm initialRate={12500} />);

    const input = screen.getByLabelText(/Курс доллара/i);
    fireEvent.change(input, { target: { value: "150000" } });

    const submitBtn = screen.getByRole("button", { name: /Сохранить вручную/i });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText("Курс USD не может превышать 100 000 сум.")
    ).toBeDefined();
    expect(settingsActions.updateExchangeRate).not.toHaveBeenCalled();
  });

  it("successfully updates exchange rate manually via updateExchangeRate action", async () => {
    vi.mocked(settingsActions.updateExchangeRate).mockResolvedValueOnce({
      success: true,
      data: {
        exchangeRate: 13000,
        updatedAt: "2026-08-31T16:00:00.000Z",
        source: "Ручной ввод (Администратор)",
      },
    });

    render(<ExchangeRateForm initialRate={12500} />);

    const input = screen.getByLabelText(/Курс доллара/i);
    fireEvent.change(input, { target: { value: "13000" } });

    const submitBtn = screen.getByRole("button", { name: /Сохранить вручную/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(settingsActions.updateExchangeRate).toHaveBeenCalledWith({
        rate: 13000,
      });
    });

    expect(
      await screen.findByText("Курс успешно сохранен вручную: 1 USD = 13 000 сум")
    ).toBeDefined();
    expect(screen.getByText("Ручной ввод (Администратор)")).toBeDefined();
  });

  it("allows cancelling manual edit and reverts input to current rate", () => {
    render(<ExchangeRateForm initialRate={12500} />);

    const input = screen.getByLabelText(/Курс доллара/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "14000" } });
    expect(input.value).toBe("14000");

    const cancelBtn = screen.getByRole("button", { name: /Отмена/i });
    fireEvent.click(cancelBtn);

    expect(input.value).toBe("12500");
  });
});
