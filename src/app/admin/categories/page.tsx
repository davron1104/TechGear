import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { AdminCategoriesClient } from "./categories-client";

export const metadata = {
  title: "Панель администратора: Категории — TechGear",
  description: "Панель управления категориями товаров TechGear.",
};

export default async function AdminCategoriesPage() {
  // 1. Session check
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // 2. Fetch categories with product count
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <AdminCategoriesClient initialCategories={categories} />;
}
