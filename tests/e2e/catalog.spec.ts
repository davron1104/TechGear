import { test, expect } from "@playwright/test";

test.describe("E2E: Catalog Navigation", () => {
  test("should navigate: Home -> Catalog -> Category -> Product Detail", async ({ page }) => {
    // 1. Открываем главную страницу
    await page.goto("/");
    await expect(page).toHaveTitle(/TechGear/);

    // 2. Переходим в каталог по кнопке на баннере
    const catalogLink = page.getByRole("link", { name: "Смотреть каталог" });
    await expect(catalogLink).toBeVisible();
    await catalogLink.click();
    await expect(page).toHaveURL(/\/catalog$/);

    // 3. Выбираем категорию "Мониторы"
    const monitorsCategoryLink = page.getByRole("link", { name: "Мониторы" }).first();
    await expect(monitorsCategoryLink).toBeVisible();
    await monitorsCategoryLink.click();
    await expect(page).toHaveURL(/\/catalog\/monitors$/);

    // 4. Убеждаемся, что в списке есть наш монитор, и переходим на его страницу
    const productCardTitle = page.getByRole("heading", { name: 'Игровой монитор Horizon Ultra 27" 165Hz' });
    await expect(productCardTitle).toBeVisible();
    
    // Кликаем по ссылке карточки товара
    const productLink = page.locator('a[href="/product/horizon-ultra-27-165hz"]').first();
    await productLink.click();
    await expect(page).toHaveURL(/\/product\/horizon-ultra-27-165hz$/);

    // 5. Проверяем корректное отображение страницы товара
    // Название товара (уникальный заголовок страницы)
    const productHeading = page.getByRole("heading", { name: 'Игровой монитор Horizon Ultra 27" 165Hz' });
    await expect(productHeading).toBeVisible();
    // Бренд
    await expect(page.locator("text=Horizon").first()).toBeVisible();
    // Характеристики
    await expect(page.locator("text=Характеристики")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Fast IPS" })).toBeVisible();
  });
});
