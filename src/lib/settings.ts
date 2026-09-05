/**
 * Centralized keys for SystemSetting table in the database
 */
export const SHOP_PHONE_KEY = "SHOP_PHONE";
export const SHOP_EMAIL_KEY = "SHOP_EMAIL";
export const SHOP_ADDRESS_KEY = "SHOP_ADDRESS";
export const SHOP_WORKING_HOURS_KEY = "SHOP_WORKING_HOURS";
export const DELIVERY_COST_UZS_KEY = "DELIVERY_COST_UZS";
export const FREE_DELIVERY_THRESHOLD_UZS_KEY = "FREE_DELIVERY_THRESHOLD_UZS";
export const HOME_TEXT_BLOCK_KEY = "HOME_TEXT_BLOCK";

export interface ShopSettings {
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  deliveryCostUzs: number;
  freeDeliveryThresholdUzs: number;
}

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  phone: "+7 (800) 555-35-35",
  email: "support@techgear.uz",
  address: "г. Ташкент, ул. Амира Темура, д. 42",
  workingHours: "Пн–Вс: 09:00 – 21:00",
  deliveryCostUzs: 30000,
  freeDeliveryThresholdUzs: 500000,
};

export interface LocalizedFeature {
  title: string;
  description: string;
}

export interface LocalizedTextContent {
  title: string;
  content: string;
  features: [LocalizedFeature, LocalizedFeature, LocalizedFeature];
}

export interface HomeTextBlockSettings {
  enabled: boolean;
  ru: LocalizedTextContent;
  uz: LocalizedTextContent;
  en: LocalizedTextContent;
}

export const DEFAULT_HOME_TEXT_BLOCK_SETTINGS: HomeTextBlockSettings = {
  enabled: true,
  ru: {
    title: "Официальный магазин профессиональной техники TechGear",
    content:
      "Мы отбираем только премиальные устройства и геймерскую периферию от ведущих мировых брендов. Быстрая доставка по всему Узбекистану, официальная гарантия качества и экспертная техническая поддержка для каждого клиента.",
    features: [
      { title: "100% Оригинал", description: "Официальная гарантия" },
      { title: "Быстрая доставка", description: "По всему Узбекистану" },
      { title: "Поддержка 24/7", description: "Экспертная помощь" },
    ],
  },
  uz: {
    title: "TechGear professional texnika rasmiy do'koni",
    content:
      "Biz jahonning yetakchi brendlaridan faqat premium darajadagi qurilmalar va o'yin aksessuarlarini saralab taqdim etamiz. Butun O'zbekiston bo'ylab tezkor yetkazib berish, rasmiy sifat kafolati va har bir mijoz uchun professional texnik yordam.",
    features: [
      { title: "100% Asl mahsulot", description: "Rasmiy kafolat" },
      { title: "Tezkor yetkazib berish", description: "Butun O'zbekiston bo'ylab" },
      { title: "24/7 Qo'llab-quvvatlash", description: "Professional yordam" },
    ],
  },
  en: {
    title: "TechGear Official Professional Gear Store",
    content:
      "We curate only premium computing devices and gaming peripherals from world-leading brands. Fast delivery across Uzbekistan, official quality warranty, and expert technical support for every customer.",
    features: [
      { title: "100% Genuine", description: "Official warranty" },
      { title: "Fast Delivery", description: "Across all Uzbekistan" },
      { title: "24/7 Support", description: "Expert assistance" },
    ],
  },
};
