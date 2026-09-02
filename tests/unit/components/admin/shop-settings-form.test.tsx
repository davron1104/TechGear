import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShopSettingsForm } from "@/components/admin/settings/shop-settings-form";
import { updateShopSettings } from "@/actions/settings-actions";
import { DEFAULT_SHOP_SETTINGS } from "@/lib/settings";

vi.mock("@/actions/settings-actions", () => ({
  updateShopSettings: vi.fn(),
}));

describe("ShopSettingsForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with initial settings", () => {
    render(<ShopSettingsForm initialSettings={DEFAULT_SHOP_SETTINGS} />);

    expect(screen.getByLabelText(/Телефон магазина/i)).toHaveValue(
      DEFAULT_SHOP_SETTINGS.phone
    );
    expect(screen.getByLabelText(/Email службы поддержки/i)).toHaveValue(
      DEFAULT_SHOP_SETTINGS.email
    );
    expect(
      screen.getByLabelText(/Адрес магазина \/ пункта самовывоза/i)
    ).toHaveValue(DEFAULT_SHOP_SETTINGS.address);
    expect(screen.getByLabelText(/Часы работы магазина/i)).toHaveValue(
      DEFAULT_SHOP_SETTINGS.workingHours
    );
    expect(
      screen.getByLabelText(/Стоимость курьерской доставки \(UZS\)/i)
    ).toHaveValue(DEFAULT_SHOP_SETTINGS.deliveryCostUzs);
    expect(
      screen.getByLabelText(/Порог бесплатной доставки \(UZS\)/i)
    ).toHaveValue(DEFAULT_SHOP_SETTINGS.freeDeliveryThresholdUzs);
  });

  it("submits updated shop settings and displays success message", async () => {
    const user = userEvent.setup();
    vi.mocked(updateShopSettings).mockResolvedValueOnce({
      success: true,
      data: {
        phone: "+998 71 333 44 55",
        email: "support@techgear.uz",
        address: "г. Ташкент, ул. Амира Темура, 100",
        workingHours: "09:00 - 22:00",
        deliveryCostUzs: 40000,
        freeDeliveryThresholdUzs: 700000,
      },
    });

    render(<ShopSettingsForm initialSettings={DEFAULT_SHOP_SETTINGS} />);

    const phoneInput = screen.getByLabelText(/Телефон магазина/i);
    await user.clear(phoneInput);
    await user.type(phoneInput, "+998 71 333 44 55");

    const submitButton = screen.getByRole("button", {
      name: /Сохранить настройки магазина/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(updateShopSettings).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Настройки магазина успешно сохранены/i)).toBeInTheDocument();
    });
  });

  it("displays server validation error when update fails", async () => {
    const user = userEvent.setup();
    vi.mocked(updateShopSettings).mockResolvedValueOnce({
      success: false,
      error: "Ошибка валидации настроек магазина.",
      fields: {
        email: ["Некорректный формат email адреса"],
      },
    });

    render(<ShopSettingsForm initialSettings={DEFAULT_SHOP_SETTINGS} />);

    const submitButton = screen.getByRole("button", {
      name: /Сохранить настройки магазина/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Ошибка сохранения")).toBeInTheDocument();
      expect(screen.getByText("Некорректный формат email адреса")).toBeInTheDocument();
    });
  });
});
