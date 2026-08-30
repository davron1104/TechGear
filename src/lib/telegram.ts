export interface TelegramOrderItem {
  productName: string;
  price: number;
  quantity: number;
}

export interface TelegramOrderPayload {
  orderNumber: string;
  createdAt?: string | Date;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryMethod: string;
  city: string;
  street?: string | null;
  house?: string | null;
  apartment?: string | null;
  comment?: string | null;
  items: TelegramOrderItem[];
  goodsTotal: number;
  deliveryCost: number;
  totalAmount: number;
}

/**
 * Escapes special HTML characters to prevent breaking Telegram's parse_mode="HTML".
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Formats order details into a clean, safe HTML message for Telegram administrators.
 */
export function formatOrderMessage(order: TelegramOrderPayload): string {
  const safeOrderNumber = escapeHtml(order.orderNumber);
  const safeCustomerName = escapeHtml(order.customerName);
  const safePhone = escapeHtml(order.customerPhone);
  const safeEmail = escapeHtml(order.customerEmail);
  const safeCity = escapeHtml(order.city);

  const deliveryMethodText =
    order.deliveryMethod === "courier" ? "Курьерская доставка" : "Самовывоз";

  let addressLine = "";
  if (order.deliveryMethod === "courier") {
    const parts = [
      order.city ? `г. ${escapeHtml(order.city)}` : "",
      order.street ? `ул. ${escapeHtml(order.street)}` : "",
      order.house ? `д. ${escapeHtml(order.house)}` : "",
      order.apartment ? `кв. ${escapeHtml(order.apartment)}` : "",
    ].filter(Boolean);
    addressLine = parts.join(", ");
  }

  const itemsLines = order.items
    .map((item, index) => {
      const safeName = escapeHtml(item.productName);
      const itemTotal = (item.price * item.quantity).toLocaleString("ru-RU");
      const itemPrice = item.price.toLocaleString("ru-RU");
      return `${index + 1}. <b>${safeName}</b> — ${item.quantity} шт. × ${itemPrice} ₽ = ${itemTotal} ₽`;
    })
    .join("\n");

  const lines: string[] = [
    `📦 <b>Новый заказ №${safeOrderNumber}</b>`,
  ];

  if (order.createdAt) {
    const dateObj =
      typeof order.createdAt === "string"
        ? new Date(order.createdAt)
        : order.createdAt;
    const formattedDate = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })
      : escapeHtml(String(order.createdAt));
    lines.push(`📅 <i>Дата: ${formattedDate}</i>`);
  }

  lines.push(
    "",
    `👤 <b>Покупатель:</b> ${safeCustomerName}`,
    `📞 <b>Телефон:</b> ${safePhone}`,
    `✉️ <b>Email:</b> ${safeEmail}`,
    "",
    `🚚 <b>Способ доставки:</b> ${deliveryMethodText}`
  );

  if (order.deliveryMethod === "courier" && addressLine) {
    lines.push(`📍 <b>Адрес:</b> ${addressLine}`);
  } else if (order.deliveryMethod === "pickup") {
    lines.push(`📍 <b>Пункт выдачи:</b> г. ${safeCity}`);
  }

  if (order.comment && order.comment.trim()) {
    lines.push(`💬 <b>Комментарий:</b> ${escapeHtml(order.comment.trim())}`);
  }

  lines.push(
    "",
    `🛒 <b>Состав заказа:</b>`,
    itemsLines || "<i>(нет товаров)</i>",
    "",
    `Сумма товаров: ${order.goodsTotal.toLocaleString("ru-RU")} ₽`,
    `Доставка: ${order.deliveryCost.toLocaleString("ru-RU")} ₽`,
    `💵 <b>Итого к оплате:</b> ${order.totalAmount.toLocaleString("ru-RU")} ₽`
  );

  return lines.join("\n");
}

/**
 * Sends a Telegram notification for a new order to the administrators chat.
 * - Fire-and-forget compatible.
 * - Handles errors gracefully without throwing to prevent breaking order placement.
 * - Never leaks secret bot token into logs.
 */
export async function sendOrderTelegramNotification(
  order: TelegramOrderPayload
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (
    !token ||
    token === "your-bot-token" ||
    !chatId ||
    chatId === "your-chat-id"
  ) {
    console.warn(
      "[TelegramService] Notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured."
    );
    return false;
  }

  try {
    const message = formatOrderMessage(order);
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "unknown response");
      console.error(
        `[TelegramService] Failed to send message. HTTP status: ${response.status}. Response: ${errorBody}`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "[TelegramService] Network or unexpected error while sending notification:",
      error instanceof Error ? error.message : error
    );
    return false;
  }
}
