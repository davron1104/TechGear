import { test, expect } from "@playwright/test";

test.describe("E2E: Checkout Flow", () => {
  test("should validate form fields, place order successfully, and verify empty cart", async ({ page }) => {
    // 1. Открываем страницу товара и добавляем его в корзину
    await page.goto("/product/horizon-ultra-27-165hz");
    const addToCartBtn = page.getByRole("button", { name: "Добавить в корзину" });
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    // 2. Переходим на страницу оформления заказа через корзину
    const openCartBtn = page.getByRole("button", { name: "Открыть корзину" });
    await expect(openCartBtn).toBeVisible();
    await openCartBtn.click();

    const checkoutLink = page.getByRole("link", { name: "Оформить заказ" });
    await expect(checkoutLink).toBeVisible();
    await checkoutLink.click();
    await expect(page).toHaveURL(/\/checkout$/);

    // 3. Проверяем валидацию полей (отправляем пустую форму)
    const submitBtn = page.getByRole("button", { name: "Подтвердить заказ" });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Ожидаем ошибки валидации
    await expect(page.locator("text=Укажите имя получателя")).toBeVisible();
    await expect(page.locator("text=Укажите адрес электронной почты")).toBeVisible();
    await expect(page.locator("text=Укажите номер телефона")).toBeVisible();
    await expect(page.locator("text=Укажите улицу для курьерской доставки")).toBeVisible();
    await expect(page.locator("text=Укажите номер дома")).toBeVisible();

    // 4. Заполняем валидные данные
    await page.fill('input[id="name"]', "Алексей Иванов");
    await page.fill('input[id="email"]', "alex@example.com");
    await page.fill('input[id="phone"]', "+7 (999) 111-22-33");
    await page.fill('input[id="street"]', "Ленина");
    await page.fill('input[id="house"]', "15");

    // 5. Оформляем заказ
    await submitBtn.click();

    // Ожидаем редирект на страницу успеха
    await expect(page).toHaveURL(/\/checkout\/success/);
    await expect(page.getByRole("heading", { name: "Спасибо за ваш заказ!" })).toBeVisible();

    // 6. Проверяем, что корзина очистилась
    // Возвращаемся в каталог (где есть стандартный Header с кнопкой корзины)
    const backToCatalogLink = page.getByRole("link", { name: "Вернуться в каталог" });
    await expect(backToCatalogLink).toBeVisible();
    await backToCatalogLink.click();
    await expect(page).toHaveURL(/\/$/);

    // Открываем корзину на главной странице
    await expect(openCartBtn).toBeVisible();
    await openCartBtn.click();

    // Ожидаем, что в панели корзины будет текст, что она пуста
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText("Ваша корзина пуста", { exact: true })).toBeVisible();
  });
});
