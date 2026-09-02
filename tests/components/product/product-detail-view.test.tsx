import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import {
  ProductDetailView,
  clearDraftQuantities,
} from "@/components/product/product-detail-view";
import { Product } from "@/types/product";
import { useCart } from "@/hooks/use-cart";

const mockProduct: Product = {
  id: "prod-draft-1",
  slug: "gaming-keyboard-pro",
  name: "Gaming Keyboard Pro",
  description: "Mechanical gaming keyboard",
  shortDescription: "Pro mechanical keyboard",
  price: 1990,
  image: "/images/keyboard.jpg",
  images: ["/images/keyboard.jpg"],
  categoryId: "cat-keyboards",
  categorySlug: "keyboards",
  categoryName: "Клавиатуры",
  brand: "TechGear",
  stock: 10,
  characteristics: {},
  createdAt: new Date().toISOString(),
};

describe("ProductDetailView Draft Quantity Cache", () => {
  beforeEach(() => {
    clearDraftQuantities();
    useCart.getState().clearCart();
    cleanup();
  });

  it("should initialize with quantity 1 for in-stock product", () => {
    render(<ProductDetailView product={mockProduct} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getAllByText(/1 990/).length).toBeGreaterThan(0);
  });

  it("should preserve modified quantity across unmount and remount (simulating locale switch)", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<ProductDetailView product={mockProduct} />);

    // Увеличиваем количество с 1 до 3
    const plusButton = screen.getByRole("button", { name: "Увеличить количество" });
    await user.click(plusButton);
    await user.click(plusButton);

    expect(screen.getByText("3")).toBeInTheDocument();

    // Симулируем размонтирование (например, смена языка /en/... -> /ru/...)
    unmount();

    // Повторный рендер того же товара
    render(<ProductDetailView product={mockProduct} />);

    // Состояние 3 должно сохраниться
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should isolate draft quantity between different products", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<ProductDetailView product={mockProduct} />);

    // Увеличиваем количество первого товара до 4
    const plusButton = screen.getByRole("button", { name: "Увеличить количество" });
    await user.click(plusButton);
    await user.click(plusButton);
    await user.click(plusButton);
    expect(screen.getByText("4")).toBeInTheDocument();

    unmount();

    // Открываем другой товар
    const anotherProduct: Product = {
      ...mockProduct,
      id: "prod-draft-2",
      slug: "gaming-mouse-ultra",
      name: "Gaming Mouse Ultra",
    };

    render(<ProductDetailView product={anotherProduct} />);

    // У второго товара должно быть 1
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("should clamp cached quantity if product stock has decreased", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<ProductDetailView product={mockProduct} />);

    // Увеличиваем количество до 5
    const plusButton = screen.getByRole("button", { name: "Увеличить количество" });
    for (let i = 0; i < 4; i++) {
      await user.click(plusButton);
    }
    expect(screen.getByText("5")).toBeInTheDocument();

    unmount();

    // Повторный рендер, но теперь у товара осталось только 2 штуки
    const lowStockProduct: Product = {
      ...mockProduct,
      stock: 2,
    };

    render(<ProductDetailView product={lowStockProduct} />);

    // Количество должно автоматически ограничиться остатком (2)
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("should set quantity to 0 if product is out of stock", () => {
    const outOfStockProduct: Product = {
      ...mockProduct,
      stock: 0,
    };

    render(<ProductDetailView product={outOfStockProduct} />);

    const outOfStockBtn = screen.getByRole("button", { name: "Товар временно отсутствует" });
    expect(outOfStockBtn).toBeInTheDocument();
    expect(outOfStockBtn).toBeDisabled();
  });
});
