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

  it("renders form with initial settings and supports language tab switching", async () => {
    const user = userEvent.setup();
    render(<ShopSettingsForm initialSettings={DEFAULT_SHOP_SETTINGS} />);

    expect(screen.getByLabelText(/Телефон поддержки/i)).toHaveValue(
      DEFAULT_SHOP_SETTINGS.phone
    );
    expect(screen.getByLabelText(/Email поддержки/i)).toHaveValue(
      DEFAULT_SHOP_SETTINGS.email
    );

    // Initial RU tab
    expect(screen.getByLabelText(/Адрес магазина \(RU\)/i)).toHaveValue(
      DEFAULT_SHOP_SETTINGS.address.ru
    );
    expect(screen.getByLabelText(/Режим работы \(RU\)/i)).toHaveValue(
      DEFAULT_SHOP_SETTINGS.workingHours.ru
    );

    // Switch to UZ tabs for both address and working hours
    const uzTabs = screen.getAllByRole("button", { name: /UZ/i });
    for (const tab of uzTabs) {
      await user.click(tab);
    }

    expect(screen.getByLabelText(/Адрес магазина \(UZ\)/i)).toHaveValue(
      DEFAULT_SHOP_SETTINGS.address.uz
    );
    expect(screen.getByLabelText(/Режим работы \(UZ\)/i)).toHaveValue(
      DEFAULT_SHOP_SETTINGS.workingHours.uz
    );

    // Switch to EN tabs for both address and working hours
    const enTabs = screen.getAllByRole("button", { name: /EN/i });
    for (const tab of enTabs) {
      await user.click(tab);
    }

    expect(screen.getByLabelText(/Адрес магазина \(EN\)/i)).toHaveValue(
      DEFAULT_SHOP_SETTINGS.address.en
    );
    expect(screen.getByLabelText(/Режим работы \(EN\)/i)).toHaveValue(
      DEFAULT_SHOP_SETTINGS.workingHours.en
    );

    expect(
      screen.getByLabelText(/Стоимость курьерской доставки \(UZS\)/i)
    ).toHaveValue(DEFAULT_SHOP_SETTINGS.deliveryCostUzs);
    expect(
      screen.getByLabelText(/Порог бесплатной доставки \(UZS\)/i)
    ).toHaveValue(DEFAULT_SHOP_SETTINGS.freeDeliveryThresholdUzs);
    expect(
      screen.getByLabelText(/Закрепить информационную панель при прокрутке/i)
    ).not.toBeChecked();
  });

  it("submits updated shop settings with toggled stickyTopBar and displays success message", async () => {
    const user = userEvent.setup();
    vi.mocked(updateShopSettings).mockResolvedValueOnce({
      success: true,
      data: {
        phone: "+998 71 333 44 55",
        email: "support@techgear.uz",
        address: {
          ru: "г. Ташкент, ул. Амира Темура, 100",
          uz: "Toshkent sh., Amir Temur ko'chasi, 100",
          en: "100 Amir Temur St., Tashkent",
        },
        workingHours: {
          ru: "09:00 - 22:00",
          uz: "09:00 - 22:00",
          en: "09:00 - 22:00",
        },
        deliveryCostUzs: 40000,
        freeDeliveryThresholdUzs: 700000,
        stickyTopBar: true,
      },
    });

    render(<ShopSettingsForm initialSettings={DEFAULT_SHOP_SETTINGS} />);

    const phoneInput = screen.getByLabelText(/Телефон поддержки/i);
    await user.clear(phoneInput);
    await user.type(phoneInput, "+998 71 333 44 55");

    const stickyCheckbox = screen.getByLabelText(
      /Закрепить информационную панель при прокрутке/i
    );
    await user.click(stickyCheckbox);
    expect(stickyCheckbox).toBeChecked();

    const submitButton = screen.getByRole("button", {
      name: /Сохранить настройки магазина/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(updateShopSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: "+998 71 333 44 55",
          stickyTopBar: true,
          address: expect.objectContaining({
            ru: DEFAULT_SHOP_SETTINGS.address.ru,
          }),
        })
      );
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
