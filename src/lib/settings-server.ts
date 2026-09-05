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
  HOME_TEXT_BLOCK_KEY,
  HomeTextBlockSettings,
  LocalizedFeature,
  DEFAULT_HOME_TEXT_BLOCK_SETTINGS,
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

function parseLocalizedFeatures(
  rawFeatures: unknown,
  defaultFeatures: [LocalizedFeature, LocalizedFeature, LocalizedFeature]
): [LocalizedFeature, LocalizedFeature, LocalizedFeature] {
  const result: [LocalizedFeature, LocalizedFeature, LocalizedFeature] = [
    { ...defaultFeatures[0] },
    { ...defaultFeatures[1] },
    { ...defaultFeatures[2] },
  ];

  if (!Array.isArray(rawFeatures)) {
    return result;
  }

  for (let i = 0; i < 3; i++) {
    const item = rawFeatures[i];
    if (item && typeof item === "object") {
      const typedItem = item as { title?: unknown; description?: unknown };
      if (typeof typedItem.title === "string") {
        result[i].title = typedItem.title;
      }
      if (typeof typedItem.description === "string") {
        result[i].description = typedItem.description;
      }
    }
  }

  return result;
}

/**
 * Retrieves home page text block settings from the database (SystemSetting).
 * Safely falls back to DEFAULT_HOME_TEXT_BLOCK_SETTINGS if missing or on JSON/DB error.
 * Ensures 100% backward compatibility for existing records without features.
 */
export async function getHomeTextBlockSettings(): Promise<HomeTextBlockSettings> {
  try {
    const record = await prisma.systemSetting.findUnique({
      where: { key: HOME_TEXT_BLOCK_KEY },
    });

    if (!record || !record.value) {
      return DEFAULT_HOME_TEXT_BLOCK_SETTINGS;
    }

    const parsed = JSON.parse(record.value);
    if (!parsed || typeof parsed !== "object") {
      return DEFAULT_HOME_TEXT_BLOCK_SETTINGS;
    }

    return {
      enabled:
        typeof parsed.enabled === "boolean"
          ? parsed.enabled
          : DEFAULT_HOME_TEXT_BLOCK_SETTINGS.enabled,
      ru: {
        title:
          typeof parsed.ru?.title === "string"
            ? parsed.ru.title
            : DEFAULT_HOME_TEXT_BLOCK_SETTINGS.ru.title,
        content:
          typeof parsed.ru?.content === "string"
            ? parsed.ru.content
            : DEFAULT_HOME_TEXT_BLOCK_SETTINGS.ru.content,
        features: parseLocalizedFeatures(
          parsed.ru?.features,
          DEFAULT_HOME_TEXT_BLOCK_SETTINGS.ru.features
        ),
      },
      uz: {
        title:
          typeof parsed.uz?.title === "string"
            ? parsed.uz.title
            : DEFAULT_HOME_TEXT_BLOCK_SETTINGS.uz.title,
        content:
          typeof parsed.uz?.content === "string"
            ? parsed.uz.content
            : DEFAULT_HOME_TEXT_BLOCK_SETTINGS.uz.content,
        features: parseLocalizedFeatures(
          parsed.uz?.features,
          DEFAULT_HOME_TEXT_BLOCK_SETTINGS.uz.features
        ),
      },
      en: {
        title:
          typeof parsed.en?.title === "string"
            ? parsed.en.title
            : DEFAULT_HOME_TEXT_BLOCK_SETTINGS.en.title,
        content:
          typeof parsed.en?.content === "string"
            ? parsed.en.content
            : DEFAULT_HOME_TEXT_BLOCK_SETTINGS.en.content,
        features: parseLocalizedFeatures(
          parsed.en?.features,
          DEFAULT_HOME_TEXT_BLOCK_SETTINGS.en.features
        ),
      },
    };
  } catch (error) {
    console.error(
      "Failed to load home text block settings from database, using defaults:",
      error
    );
    return DEFAULT_HOME_TEXT_BLOCK_SETTINGS;
  }
}
