import prisma from "../src/lib/prisma";
import { MOCK_PRODUCTS } from "../src/data/mock-products";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Starting seeding database...");

  // 1. Очистка старых данных (в порядке внешних ключей)
  console.log("🧹 Clearing old data...");
  await prisma.passwordResetToken.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Создание тестовых пользователей
  console.log("👤 Creating test users...");
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const customerPasswordHash = await bcrypt.hash("customer123", 10);

  const admin = await prisma.user.create({
    data: {
      id: "user-admin-01",
      name: "Администратор TechGear",
      email: "admin@techgear.ru",
      passwordHash: adminPasswordHash,
      phone: "+7 (999) 111-22-33",
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.create({
    data: {
      id: "user-customer-01",
      name: "Иван Иванов",
      email: "customer@techgear.ru",
      passwordHash: customerPasswordHash,
      phone: "+7 (999) 444-55-66",
      role: "CUSTOMER",
    },
  });

  console.log(`Created users: admin (${admin.email}), customer (${customer.email})`);

  // 3. Создание категорий на основе MOCK_PRODUCTS
  console.log("📂 Creating categories...");
  const categoriesMap = new Map<string, { id: string; name: string; slug: string }>();
  for (const p of MOCK_PRODUCTS) {
    if (!categoriesMap.has(p.categoryId)) {
      categoriesMap.set(p.categoryId, {
        id: p.categoryId,
        name: p.categoryName,
        slug: p.categorySlug,
      });
    }
  }

  for (const cat of categoriesMap.values()) {
    const createdCat = await prisma.category.create({
      data: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      },
    });
    console.log(`- Category: ${createdCat.name} (${createdCat.slug})`);
  }

  // 4. Создание продуктов
  console.log("📦 Creating products...");
  for (const p of MOCK_PRODUCTS) {
    const createdProd = await prisma.product.create({
      data: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        categoryId: p.categoryId,
        price: p.price,
        image: p.image,
        images: p.images,
        shortDescription: p.shortDescription,
        description: p.description,
        stock: p.stock,
        brand: p.brand,
        characteristics: p.characteristics as any,
        createdAt: new Date(p.createdAt),
      },
    });
    console.log(`- Product: ${createdProd.name} (${createdProd.brand})`);
  }

  console.log("✅ Seeding successfully finished!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
