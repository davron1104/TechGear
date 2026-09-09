import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DeliveryView } from "@/components/shop/delivery-view";
import { WarrantyView } from "@/components/shop/warranty-view";
import { LanguageProvider } from "@/context/language-context";
import { CurrencyProvider } from "@/context/currency-context";
import { ShopSettings } from "@/lib/settings";

const customShopSettings: ShopSettings = {
  phone: "+998 71 200 00 00",
  email: "support@techgear.uz",
  address: {
    ru: "г. Ташкент, ул. Амира Темура, 100",
    uz: "Toshkent sh., Amir Temur ko'chasi, 100",
    en: "100 Amir Temur St., Tashkent",
  },
  workingHours: {
    ru: "Пн-Вс: 10:00 - 22:00",
    uz: "Dush-Yak: 10:00 - 22:00",
    en: "Mon-Sun: 10:00 - 22:00",
  },
  deliveryCostUzs: 35000,
  freeDeliveryThresholdUzs: 500000,
  stickyTopBar: false,
};

function renderDeliveryView(locale: "ru" | "uz" | "en", currency: "UZS" | "USD" = "UZS") {
  return render(
    <LanguageProvider initialLocale={locale}>
      <CurrencyProvider initialCurrency={currency}>
        <DeliveryView shopSettings={customShopSettings} />
      </CurrencyProvider>
    </LanguageProvider>
  );
}

function renderWarrantyView(locale: "ru" | "uz" | "en") {
  return render(
    <LanguageProvider initialLocale={locale}>
      <CurrencyProvider initialCurrency="UZS">
        <WarrantyView shopSettings={customShopSettings} />
      </CurrencyProvider>
    </LanguageProvider>
  );
}

describe("Info Pages Components", () => {
  describe("DeliveryView", () => {
    it("should render Russian delivery page with dynamic ShopSettings data", () => {
      renderDeliveryView("ru");

      // Heading and breadcrumbs
      expect(screen.getByRole("heading", { level: 1, name: "Доставка и оплата" })).toBeInTheDocument();
      expect(screen.getByText("Главная")).toBeInTheDocument();

      // Section titles
      expect(screen.getByText("Тарифы и бесплатная доставка")).toBeInTheDocument();
      expect(screen.getByText("Сроки и получение заказов")).toBeInTheDocument();
      expect(screen.getByText("Способы оплаты")).toBeInTheDocument();
      expect(screen.getByText("Безопасность и порядок расчетов")).toBeInTheDocument();

      // Contact details from ShopSettings
      expect(screen.getByText("+998 71 200 00 00")).toBeInTheDocument();
      expect(screen.getByText("support@techgear.uz")).toBeInTheDocument();
      expect(screen.getByText("г. Ташкент, ул. Амира Темура, 100")).toBeInTheDocument();
      expect(screen.getByText("Пн-Вс: 10:00 - 22:00")).toBeInTheDocument();

      // Formatted prices in description
      expect(screen.getByText(/35 000/)).toBeInTheDocument();
      expect(screen.getByText(/500 000/)).toBeInTheDocument();
    });

    it("should render Uzbek delivery page correctly with localized address and working hours", () => {
      renderDeliveryView("uz");

      expect(screen.getByRole("heading", { level: 1, name: "Yetkazib berish va to'lov" })).toBeInTheDocument();
      expect(screen.getByText("Bosh sahifa")).toBeInTheDocument();
      expect(screen.getByText("Tariflar va bepul yetkazib berish")).toBeInTheDocument();
      expect(screen.getByText("To'lov usullari")).toBeInTheDocument();

      expect(screen.getByText("Toshkent sh., Amir Temur ko'chasi, 100")).toBeInTheDocument();
      expect(screen.getByText("Dush-Yak: 10:00 - 22:00")).toBeInTheDocument();
    });

    it("should render English delivery page correctly with localized address and working hours", () => {
      renderDeliveryView("en");

      expect(screen.getByRole("heading", { level: 1, name: "Delivery & Payment" })).toBeInTheDocument();
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Rates & Free Delivery")).toBeInTheDocument();
      expect(screen.getByText("Payment Methods")).toBeInTheDocument();

      expect(screen.getByText("100 Amir Temur St., Tashkent")).toBeInTheDocument();
      expect(screen.getByText("Mon-Sun: 10:00 - 22:00")).toBeInTheDocument();
    });
  });

  describe("WarrantyView", () => {
    it("should render Russian warranty page with neutral workflow steps and contacts", () => {
      renderWarrantyView("ru");

      // Heading and breadcrumbs
      expect(
        screen.getByRole("heading", { level: 1, name: "Гарантия и сервисное обслуживание" })
      ).toBeInTheDocument();
      expect(screen.getByText("Главная")).toBeInTheDocument();

      // Section titles
      expect(screen.getByText("Условия гарантийного обслуживания")).toBeInTheDocument();
      expect(screen.getByText("Подтверждающие документы")).toBeInTheDocument();
      expect(screen.getByText("Порядок обращения")).toBeInTheDocument();
      expect(screen.getByText("Обмен и возврат товара")).toBeInTheDocument();

      // 3 steps
      expect(screen.getByText("Обращение в службу поддержки")).toBeInTheDocument();
      expect(screen.getByText("Консультация специалистов")).toBeInTheDocument();
      expect(screen.getByText("Рассмотрение вопроса")).toBeInTheDocument();
      expect(screen.getByText("01")).toBeInTheDocument();
      expect(screen.getByText("02")).toBeInTheDocument();
      expect(screen.getByText("03")).toBeInTheDocument();

      // Contacts from ShopSettings
      expect(screen.getByText("+998 71 200 00 00")).toBeInTheDocument();
      expect(screen.getByText("support@techgear.uz")).toBeInTheDocument();
      expect(screen.getByText("г. Ташкент, ул. Амира Темура, 100")).toBeInTheDocument();
      expect(screen.getByText("Пн-Вс: 10:00 - 22:00")).toBeInTheDocument();
    });

    it("should render Uzbek warranty page correctly with localized address and working hours", () => {
      renderWarrantyView("uz");

      expect(
        screen.getByRole("heading", { level: 1, name: "Kafolat va servis xizmati" })
      ).toBeInTheDocument();
      expect(screen.getByText("Bosh sahifa")).toBeInTheDocument();
      expect(screen.getByText("Kafolatli xizmat ko'rsatish shartlari")).toBeInTheDocument();
      expect(screen.getByText("Murojaat qilish tartibi")).toBeInTheDocument();
      expect(screen.getByText("Qo'llab-quvvatlash xizmatiga murojaat")).toBeInTheDocument();

      expect(screen.getByText("Toshkent sh., Amir Temur ko'chasi, 100")).toBeInTheDocument();
      expect(screen.getByText("Dush-Yak: 10:00 - 22:00")).toBeInTheDocument();
    });

    it("should render English warranty page correctly with localized address and working hours", () => {
      renderWarrantyView("en");

      expect(
        screen.getByRole("heading", { level: 1, name: "Warranty & Service Support" })
      ).toBeInTheDocument();
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Warranty Service Terms")).toBeInTheDocument();
      expect(screen.getByText("Inquiry Procedure")).toBeInTheDocument();
      expect(screen.getByText("Contact Customer Support")).toBeInTheDocument();

      expect(screen.getByText("100 Amir Temur St., Tashkent")).toBeInTheDocument();
      expect(screen.getByText("Mon-Sun: 10:00 - 22:00")).toBeInTheDocument();
    });
  });
});
