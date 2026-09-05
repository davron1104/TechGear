import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HomeTextBlock } from "@/components/catalog/home-text-block";
import { HomeTextBlockSettings } from "@/lib/settings";

const mockSettings: HomeTextBlockSettings = {
  enabled: true,
  ru: {
    title: "Официальный магазин TechGear RU",
    content: "Описание на русском языке",
    features: [
      { title: "100% Оригинал RU", description: "Гарантия 1 год" },
      { title: "Экспресс-доставка RU", description: "В день заказа" },
      { title: "Премиум-сервис RU", description: "Круглосуточно" },
    ],
  },
  uz: {
    title: "TechGear rasmiy do'koni UZ",
    content: "Tavsif o'zbek tilida",
    features: [
      { title: "100% Asl UZ", description: "1 yillik kafolat" },
      { title: "Tezkor yetkazish UZ", description: "Buyurtma kuni" },
      { title: "Premium xizmat UZ", description: "24/7 rejimida" },
    ],
  },
  en: {
    title: "TechGear Official Store EN",
    content: "Description in English",
    features: [
      { title: "100% Genuine EN", description: "1 year warranty" },
      { title: "Express Delivery EN", description: "Same day dispatch" },
      { title: "Premium Service EN", description: "24/7 assistance" },
    ],
  },
};

describe("HomeTextBlock Component", () => {
  it("should render Russian text and custom Russian features when locale is ru", () => {
    render(<HomeTextBlock settings={mockSettings} locale="ru" />);

    expect(
      screen.getByRole("heading", { name: /Официальный магазин TechGear RU/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Описание на русском языке/i)).toBeInTheDocument();
    expect(screen.getByText("TechGear Store")).toBeInTheDocument();

    expect(screen.getByText("100% Оригинал RU")).toBeInTheDocument();
    expect(screen.getByText("Гарантия 1 год")).toBeInTheDocument();
    expect(screen.getByText("Экспресс-доставка RU")).toBeInTheDocument();
    expect(screen.getByText("Премиум-сервис RU")).toBeInTheDocument();
  });

  it("should render Uzbek text and custom Uzbek features when locale is uz", () => {
    render(<HomeTextBlock settings={mockSettings} locale="uz" />);

    expect(
      screen.getByRole("heading", { name: /TechGear rasmiy do'koni UZ/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Tavsif o'zbek tilida/i)).toBeInTheDocument();

    expect(screen.getByText("100% Asl UZ")).toBeInTheDocument();
    expect(screen.getByText("1 yillik kafolat")).toBeInTheDocument();
    expect(screen.getByText("Tezkor yetkazish UZ")).toBeInTheDocument();
  });

  it("should render English text and custom English features when locale is en", () => {
    render(<HomeTextBlock settings={mockSettings} locale="en" />);

    expect(
      screen.getByRole("heading", { name: /TechGear Official Store EN/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Description in English/i)).toBeInTheDocument();

    expect(screen.getByText("100% Genuine EN")).toBeInTheDocument();
    expect(screen.getByText("Same day dispatch")).toBeInTheDocument();
  });

  it("should fallback features to Russian if Uzbek features are empty", () => {
    const settingsWithoutUzFeatures: HomeTextBlockSettings = {
      ...mockSettings,
      uz: {
        title: "Sarlavha UZ",
        content: "Matn UZ",
        features: [
          { title: "", description: "" },
          { title: "", description: "" },
          { title: "", description: "" },
        ],
      },
    };

    render(<HomeTextBlock settings={settingsWithoutUzFeatures} locale="uz" />);

    expect(
      screen.getByRole("heading", { name: /Sarlavha UZ/i })
    ).toBeInTheDocument();
    expect(screen.getByText("100% Оригинал RU")).toBeInTheDocument();
    expect(screen.getByText("Гарантия 1 год")).toBeInTheDocument();
  });

  it("should return null and not render when enabled is false", () => {
    const disabledSettings: HomeTextBlockSettings = {
      ...mockSettings,
      enabled: false,
    };

    const { container } = render(
      <HomeTextBlock settings={disabledSettings} locale="ru" />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should return null if title and content are both empty", () => {
    const emptySettings: HomeTextBlockSettings = {
      enabled: true,
      ru: {
        title: "",
        content: "",
        features: [
          { title: "", description: "" },
          { title: "", description: "" },
          { title: "", description: "" },
        ],
      },
      uz: {
        title: "",
        content: "",
        features: [
          { title: "", description: "" },
          { title: "", description: "" },
          { title: "", description: "" },
        ],
      },
      en: {
        title: "",
        content: "",
        features: [
          { title: "", description: "" },
          { title: "", description: "" },
          { title: "", description: "" },
        ],
      },
    };

    const { container } = render(
      <HomeTextBlock settings={emptySettings} locale="ru" />
    );

    expect(container.firstChild).toBeNull();
  });
});
