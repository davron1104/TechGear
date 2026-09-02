/**
 * Centralized keys for SystemSetting table in the database
 */
export const SHOP_PHONE_KEY = "SHOP_PHONE";
export const SHOP_EMAIL_KEY = "SHOP_EMAIL";
export const SHOP_ADDRESS_KEY = "SHOP_ADDRESS";
export const SHOP_WORKING_HOURS_KEY = "SHOP_WORKING_HOURS";
export const DELIVERY_COST_UZS_KEY = "DELIVERY_COST_UZS";
export const FREE_DELIVERY_THRESHOLD_UZS_KEY = "FREE_DELIVERY_THRESHOLD_UZS";

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
