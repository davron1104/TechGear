import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProductBuyBox } from "@/components/product/product-buy-box";
import { Product } from "@/types/product";
import { useCart } from "@/hooks/use-cart";

const mockProductInStock: Product = {
  id: "prod-1",
  slug: "test-product",
  name: "Test Laptop",
  description: "Test description",
  shortDescription: "Short desc",
  price: 50000,
  image: "/images/laptop.jpg",
  images: ["/images/laptop.jpg"],
  categoryId: "cat-1",
  categorySlug: "laptops",
  categoryName: "Ноутбуки",
  brand: "TechBrand",
  stock: 3, // Доступно 3 штуки
  characteristics: {},
  createdAt: new Date().toISOString(),
};

describe("ProductBuyBox Component", () => {
  const onQuantityChangeMock = vi.fn();

  beforeEach(() => {
    onQuantityChangeMock.mockClear();
    useCart.getState().clearCart();
  });

  it("should render product information and initial price calculation", () => {
    render(
      <ProductBuyBox
        product={mockProductInStock}
        quantity={1}
        onQuantityChange={onQuantityChangeMock}
      />
    );

    expect(screen.getByText("Test Laptop")).toBeInTheDocument();
    expect(screen.getByText("Ноутбуки")).toBeInTheDocument();
    expect(screen.getByText("TechBrand")).toBeInTheDocument();
    
    // Проверяем наличие цены за штуку и итоговой суммы
    const priceElements = screen.getAllByText(/50 000/);
    expect(priceElements.length).toBe(2);
  });

  it("should call onQuantityChange with incremented value when clicking plus button", async () => {
    const user = userEvent.setup();
    render(
      <ProductBuyBox
        product={mockProductInStock}
        quantity={1}
        onQuantityChange={onQuantityChangeMock}
      />
    );

    const plusButton = screen.getByRole("button", { name: "Увеличить количество" });
    await user.click(plusButton);

    expect(onQuantityChangeMock).toHaveBeenCalledWith(2);
  });

  it("should call onQuantityChange with decremented value when clicking minus button", async () => {
    const user = userEvent.setup();
    render(
      <ProductBuyBox
        product={mockProductInStock}
        quantity={2}
        onQuantityChange={onQuantityChangeMock}
      />
    );

    const minusButton = screen.getByRole("button", { name: "Уменьшить количество" });
    await user.click(minusButton);

    expect(onQuantityChangeMock).toHaveBeenCalledWith(1);
  });

  it("should disable minus button when quantity is 1", () => {
    render(
      <ProductBuyBox
        product={mockProductInStock}
        quantity={1}
        onQuantityChange={onQuantityChangeMock}
      />
    );

    const minusButton = screen.getByRole("button", { name: "Уменьшить количество" });
    expect(minusButton).toBeDisabled();
  });

  it("should disable plus button when quantity reaches stock limit", () => {
    render(
      <ProductBuyBox
        product={mockProductInStock}
        quantity={3} // stock равен 3
        onQuantityChange={onQuantityChangeMock}
      />
    );

    const plusButton = screen.getByRole("button", { name: "Увеличить количество" });
    expect(plusButton).toBeDisabled();
  });

  it("should disable selector and show 'out of stock' button when stock is 0", () => {
    render(
      <ProductBuyBox
        product={{ ...mockProductInStock, stock: 0 }}
        quantity={0}
        onQuantityChange={onQuantityChangeMock}
      />
    );

    expect(screen.queryByRole("button", { name: "Увеличить количество" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Уменьшить количество" })).not.toBeInTheDocument();
    
    const outOfStockBtn = screen.getByRole("button", { name: "Товар временно отсутствует" });
    expect(outOfStockBtn).toBeInTheDocument();
    expect(outOfStockBtn).toBeDisabled();
  });

  it("should add product to Zustand store when 'Добавить в корзину' is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ProductBuyBox
        product={mockProductInStock}
        quantity={2}
        onQuantityChange={onQuantityChangeMock}
      />
    );

    const addToCartButton = screen.getByRole("button", { name: /В корзину|Добавить в корзину/ });
    await user.click(addToCartButton);

    // Проверяем, что в Zustand-хранилище корзины появился элемент
    const cartItems = useCart.getState().items;
    expect(cartItems).toHaveLength(1);
    expect(cartItems[0]).toEqual({
      productId: "prod-1",
      name: "Test Laptop",
      price: 50000,
      image: "/images/laptop.jpg",
      stock: 3,
      quantity: 2,
    });

    // Кнопка должна временно измениться на "Добавлено"
    expect(screen.getByText(/Добавлено/)).toBeInTheDocument();
  });
});
