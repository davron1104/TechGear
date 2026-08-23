import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { AdminProductsClient } from "./products-client";

export const metadata: Metadata = {
  title: "Управление товарами — TechGear Admin",
};

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  // Serialize Prisma Decimal and Date types for the client component
  const serializedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    categoryId: p.categoryId,
    category: p.category,
    price: Number(p.price),
    brand: p.brand,
    stock: p.stock,
    image: p.image,
    images: p.images ?? [p.image],
    shortDescription: p.shortDescription,
    description: p.description,
    characteristics: (p.characteristics as Record<string, string>) ?? {},
    deletedAt: p.deletedAt ? p.deletedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <AdminProductsClient
      initialProducts={serializedProducts}
      categories={categories}
    />
  );
}
