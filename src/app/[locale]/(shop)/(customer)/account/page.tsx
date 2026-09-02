import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserOrders } from "@/actions/order-actions";
import { AccountClientView } from "@/components/account/account-client-view";
import { getServerLocale } from "@/i18n/server";
import { getLocalizedHref } from "@/i18n";

export const metadata: Metadata = {
  title: "Личный кабинет — TechGear",
  description: "Управление заказами и персональными данными в интернет-магазине TechGear.",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    const locale = await getServerLocale();
    redirect(getLocalizedHref("/login", locale));
  }

  const res = await getUserOrders();
  const orders = res.success ? res.data : [];

  return <AccountClientView user={session.user} orders={orders} />;
}
