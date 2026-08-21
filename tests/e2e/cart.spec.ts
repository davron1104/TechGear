import { test, expect } from "@playwright/test";

test.describe("E2E: Cart Operations", () => {
  test("should perform full cart cycle: add, open, change quantity, delete, and check empty state", async ({ page }) => {
    // 1. Открываем страницу товара
    await page.goto("/product/horizon-ultra-27-165hz");
    await expect(page.locator("h1")).toContainText('Игровой монитор Horizon Ultra 27" 165Hz');

    // 2. Увеличиваем количество в ProductBuyBox до 2 шт.
    const plusBtn = page.getByRole("button", { name: "Увеличить количество" });
    await expect(plusBtn).toBeVisible();
    await plusBtn.click();

    // 3. Добавляем в корзину
    const addToCartBtn = page.getByRole("button", { name: "Добавить в корзину" });
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    // Проверяем, что кнопка перешла в состояние "Добавлено (2 шт.)"
    await expect(page.locator("text=Добавлено (2 шт.)")).toBeVisible();

    // 4. Открываем корзину через кнопку в Header
    const openCartBtn = page.getByRole("button", { name: "Открыть корзину" });
    await expect(openCartBtn).toBeVisible();
    await openCartBtn.click();

    // Проверяем, что панель корзины (dialog) открылась
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();

    // 5. Проверяем наличие товара в корзине
    await expect(drawer.locator("text=Horizon Ultra 27\" 165Hz")).toBeVisible();
    // Проверяем количество (2 шт.) конкретного товара в корзине
    const itemContainer = drawer.locator("div.flex-1", { hasText: 'Horizon Ultra 27" 165Hz' });
    await expect(itemContainer.getByText("2", { exact: true })).toBeVisible();
    // Проверяем итоговую сумму в подвале корзины (57 980 ₽, так как 28 990 * 2 = 57 980)
    // Ищем конкретно внутри строки "Итого к оплате:" через относительный xpath
    const footerLabel = drawer.getByText("Итого к оплате:", { exact: true });
    const footerRow = footerLabel.locator("xpath=..");
    const footerPrice = footerRow.locator("span.font-mono");
    await expect(footerPrice).toContainText("57 980");

    // 6. Изменяем количество в корзине (увеличиваем до 3)
    // Ищем кнопку "+" в корзине (вторая на странице, так как первая в карточке товара)
    const cartPlusBtn = page.getByRole("button", { name: "Увеличить количество" }).nth(1);
    await expect(cartPlusBtn).toBeVisible();
    await cartPlusBtn.click();

    // Сумма в подвале должна стать 86 970 ₽ (28 990 * 3 = 86 970)
    await expect(footerPrice).toContainText("86 970");

    // 7. Удаляем товар кнопкой "Очистить корзину" или уменьшением до 0.
    // Давайте нажмем на кнопку "Очистить корзину" для полной проверки
    const clearCartBtn = page.getByRole("button", { name: "Очистить корзину" });
    await expect(clearCartBtn).toBeVisible();
    await clearCartBtn.click();

    // 8. Проверяем пустое состояние корзины
    await expect(drawer.locator("text=Ваша корзина пуста")).toBeVisible();
  });
});
