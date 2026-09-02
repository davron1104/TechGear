import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import { Header } from "@/components/layout/header";
import { ProductDetailView } from "@/components/product/product-detail-view";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Product } from "@/types/product";
import { useCart } from "@/hooks/use-cart";

const mockProduct: Product = {
  id: "prod-1",
  slug: "test-laptop",
  name: "Test Laptop X",
  description: "Test description",
  shortDescription: "Short desc",
  price: 50000,
  image: "/images/laptop.jpg",
  images: ["/images/laptop.jpg"],
  categoryId: "cat-1",
  categorySlug: "laptops",
  categoryName: "Ноутбуки",
  brand: "TechBrand",
  stock: 5,
  characteristics: {},
  createdAt: new Date().toISOString(),
};

describe("Integration: Cart Flow", () => {
  beforeEach(() => {
    useCart.getState().clearCart();
    useCart.getState().closeCart();
  });

  it("should perform full cart cycle: view product -> change quantity -> add to cart -> view in drawer -> edit in drawer -> clear", async () => {
    const user = userEvent.setup();

    // 1. Рендерим Header, детальную карточку товара и корзину
    render(
      <div>
        <Header />
        <ProductDetailView product={mockProduct} />
        <CartDrawer />
      </div>
    );

    // Кнопка добавления изначально содержит "Добавить в корзину" или "В корзину" (в BuyBox и в StickyBar)
    const addToCartButton = screen.getAllByRole("button", { name: /В корзину|Добавить в корзину/ })[0];
    expect(addToCartButton).toBeInTheDocument();

    // 2. Увеличиваем количество товара в ProductBuyBox до 2 шт.
    const plusButton = screen.getByRole("button", { name: "Увеличить количество" });
    await user.click(plusButton);
    
    // Итоговая сумма в блоках цены на странице должна стать 100 000 (один в BuyBox, один в StickyBar)
    const pageTotals = screen.getAllByText(/100 000/);
    expect(pageTotals.length).toBeGreaterThanOrEqual(2);

    // 3. Добавляем в корзину
    await user.click(addToCartButton);

    // Проверяем, что кнопка перешла в состояние "Добавлено"
    expect(screen.getByText(/Добавлено/)).toBeInTheDocument();

    // Проверяем observable-результат: товар добавлен в Zustand-корзину
    expect(useCart.getState().items[0].quantity).toBe(2);

    // Проверяем счетчик товаров в корзине в Header
    const cartButton = screen.getByRole("button", { name: /Корзина|Открыть корзину/ });
    expect(within(cartButton).getByText("2")).toBeInTheDocument();

    // 4. Открываем корзину кликом по кнопке в Header
    await user.click(cartButton);

    // Получаем элемент корзины
    const drawer = screen.getByRole("dialog");

    // 5. В CartDrawer должен отобразиться наш товар
    expect(within(drawer).getByText("Test Laptop X")).toBeInTheDocument();
    
    // Счётчик количества в корзине должен быть 2 (ищем в строке товара, а не в шапке)
    const itemContainer = within(drawer).getByText("Test Laptop X").closest(".flex-1");
    expect(itemContainer).toBeInTheDocument();
    
    const htmlContainer = itemContainer as HTMLElement;
    const cartQty = within(htmlContainer).getByText("2");
    expect(cartQty).toBeInTheDocument();
    
    // Итоговая сумма к оплате в подвале корзины: 100 000 (ищем в строке "Итого:" внутри drawer)
    const footerRow = within(drawer).getByText(/Итого/).closest("div");
    expect(footerRow).toBeInTheDocument();
    const cartTotal = within(footerRow!).getByText(/100 000/);
    expect(cartTotal).toBeInTheDocument();

    // 6. Увеличиваем количество товара в корзине (CartDrawer -> CartItemRow) еще на 1
    const plusButtons = screen.getAllByRole("button", { name: "Увеличить количество" });
    const cartPlusButton = plusButtons[plusButtons.length - 1];
    
    await user.click(cartPlusButton);

    // Количество товара в корзине должно увеличиться до 3
    expect(useCart.getState().items[0].quantity).toBe(3);
    
    // Сумма в подвале должна пересчитаться на 150 000
    const footerRowAfterUpdate = within(drawer).getByText(/Итого/).closest("div");
    expect(footerRowAfterUpdate).toBeInTheDocument();
    expect(within(footerRowAfterUpdate!).getByText(/150 000/)).toBeInTheDocument();

    // 7. Очищаем корзину
    const clearCartButton = screen.getByRole("button", { name: "Очистить корзину" });
    await user.click(clearCartButton);

    // Корзина должна стать пустой
    expect(useCart.getState().items).toHaveLength(0);
    expect(screen.getByText("Ваша корзина пуста")).toBeInTheDocument();
  });
});
