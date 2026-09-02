import { Metadata } from "next";
import { getShopSettings } from "@/lib/settings-server";
import { CheckoutClientView } from "@/components/checkout/checkout-client-view";

export const metadata: Metadata = {
  title: "Оформление заказа — TechGear",
  description: "Оформление заказа премиальной техники и периферии в интернет-магазине TechGear.",
};

export default async function CheckoutPage() {
  const shopSettings = await getShopSettings();

  return <CheckoutClientView shopSettings={shopSettings} />;
}
