import { test, expect } from "@playwright/test";

test.describe("E2E: Responsive Navigation", () => {
  test("Desktop (1024px): CategoryBar is visible, Burger is hidden, Search is visible", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto("/ru");

    // CategoryBar should be visible on desktop
    const categoryBar = page.locator('nav[aria-label="Категории каталога"]');
    await expect(categoryBar).toBeVisible();

    // Burger button should be hidden on desktop
    const burgerBtn = page.locator('button[aria-controls="mobile-navigation-drawer"]');
    await expect(burgerBtn).toBeHidden();

    // Search bar in header should be visible
    const searchInput = page.locator('header input[placeholder*="Поиск"]').first();
    await expect(searchInput).toBeVisible();
  });

  test("Tablet (768px): CategoryBar is hidden, Burger is visible, Search is visible", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/ru");

    // CategoryBar should be hidden on tablet
    const categoryBar = page.locator('nav[aria-label="Категории каталога"]');
    await expect(categoryBar).toBeHidden();

    // Burger button should be visible on tablet
    const burgerBtn = page.locator('button[aria-controls="mobile-navigation-drawer"]');
    await expect(burgerBtn).toBeVisible();

    // Search input should be visible in header on tablet
    const searchInput = page.locator('header input[placeholder*="Поиск"]').first();
    await expect(searchInput).toBeVisible();

    // Clicking Burger opens drawer
    await burgerBtn.click();
    const drawer = page.locator("#mobile-navigation-drawer");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Все товары" })).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Доставка и оплата" })).toBeVisible();
  });

  test("Mobile (375px): CategoryBar is hidden, Burger and Search button are visible", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/ru");

    // CategoryBar should be hidden
    const categoryBar = page.locator('nav[aria-label="Категории каталога"]');
    await expect(categoryBar).toBeHidden();

    // Burger button should be visible
    const burgerBtn = page.locator('button[aria-controls="mobile-navigation-drawer"]');
    await expect(burgerBtn).toBeVisible();

    // Header search toggle button should be visible
    const searchToggleBtn = page.locator('header button[aria-label="Поиск по сайту"]');
    await expect(searchToggleBtn).toBeVisible();

    // Click search toggle button opens mobile search input
    await searchToggleBtn.click();
    const mobileSearchInput = page.locator('header input[placeholder*="Поиск"]').last();
    await expect(mobileSearchInput).toBeVisible();
  });
});
