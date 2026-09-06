import { test, expect } from "@playwright/test";

test.describe("E2E: Cart Operations", () => {
  test("should perform full cart cycle: add, open, change quantity, delete, and check empty state", async ({
    page,
  }) => {
    // 1. Открываем страницу товара
    await page.goto("/ru/product/horizon-ultra-27-165hz");
    await expect(page.locator("h1")).toContainText("Horizon Ultra 27");

    // 2. Увеличиваем количество в ProductBuyBox до 2 шт.
    const plusBtn = page.getByRole("button", { name: "Увеличить количество" }).first();
    await expect(plusBtn).toBeVisible();
    await plusBtn.click();

    // 3. Добавляем в корзину
    const addToCartBtn = page
      .getByRole("button", { name: /Добавить в корзину|В корзину/ })
      .first();
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    // 4. Открываем корзину через кнопку в Header
    const openCartBtn = page.getByRole("button", { name: /Корзина/ }).first();
    await expect(openCartBtn).toBeVisible();
    await openCartBtn.click();

    // Проверяем, что панель корзины (dialog) открылась
    const drawer = page.getByRole("dialog", { name: /Корзина/ });
    await expect(drawer).toBeVisible();

    // 5. Проверяем наличие товара в корзине
    await expect(drawer.locator('text=Horizon Ultra 27" 165Hz')).toBeVisible();

    // 6. Изменяем количество в корзине (увеличиваем)
    const cartPlusBtn = drawer.getByRole("button", { name: "Увеличить количество" }).first();
    await expect(cartPlusBtn).toBeVisible();
    await cartPlusBtn.click();

    // 7. Удаляем товар кнопкой "Очистить корзину"
    const clearCartBtn = drawer.getByRole("button", { name: /Очистить/ });
    await expect(clearCartBtn).toBeVisible();
    await clearCartBtn.click();

    // 8. Проверяем пустое состояние корзины
    await expect(drawer.locator("text=Ваша корзина пуста")).toBeVisible();
  });
});
