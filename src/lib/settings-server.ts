import prisma from "@/lib/prisma";
import {
  ShopSettings,
  DEFAULT_SHOP_SETTINGS,
  SHOP_PHONE_KEY,
  SHOP_EMAIL_KEY,
  SHOP_ADDRESS_KEY,
  SHOP_WORKING_HOURS_KEY,
  DELIVERY_COST_UZS_KEY,
  FREE_DELIVERY_THRESHOLD_UZS_KEY,
} from "./settings";

/**
 * Retrieves shop settings from the database (SystemSetting).
 * Uses a single batch query for maximum performance.
 * Safely falls back to DEFAULT_SHOP_SETTINGS if values are missing or on database error.
 */
export async function getShopSettings(): Promise<ShopSettings> {
  const settings: ShopSettings = { ...DEFAULT_SHOP_SETTINGS };

  try {
    const records = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: [
            SHOP_PHONE_KEY,
            SHOP_EMAIL_KEY,
            SHOP_ADDRESS_KEY,
            SHOP_WORKING_HOURS_KEY,
            DELIVERY_COST_UZS_KEY,
            FREE_DELIVERY_THRESHOLD_UZS_KEY,
          ],
        },
      },
    });

    for (const record of records) {
      if (!record.value && record.value !== "0") continue;

      switch (record.key) {
        case SHOP_PHONE_KEY:
          settings.phone = record.value.trim() || DEFAULT_SHOP_SETTINGS.phone;
          break;
        case SHOP_EMAIL_KEY:
          settings.email = record.value.trim() || DEFAULT_SHOP_SETTINGS.email;
          break;
        case SHOP_ADDRESS_KEY:
          settings.address = record.value.trim() || DEFAULT_SHOP_SETTINGS.address;
          break;
        case SHOP_WORKING_HOURS_KEY:
          settings.workingHours =
            record.value.trim() || DEFAULT_SHOP_SETTINGS.workingHours;
          break;
        case DELIVERY_COST_UZS_KEY: {
          const num = parseInt(record.value, 10);
          if (!isNaN(num) && num >= 0) {
            settings.deliveryCostUzs = num;
          }
          break;
        }
        case FREE_DELIVERY_THRESHOLD_UZS_KEY: {
          const num = parseInt(record.value, 10);
          if (!isNaN(num) && num >= 0) {
            settings.freeDeliveryThresholdUzs = num;
          }
          break;
        }
      }
    }
  } catch (error) {
    console.error("Failed to load shop settings from database, using defaults:", error);
  }

  return settings;
}
