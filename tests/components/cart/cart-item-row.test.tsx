import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { CartItem } from "@/types/cart";
import { useCart } from "@/hooks/use-cart";

const mockCartItem: CartItem = {
  productId: "prod-1",
  name: "Test Laptop",
  price: 50000,
  image: "/images/laptop.jpg",
  stock: 5,
  quantity: 2,
};

describe("CartItemRow Component", () => {
  beforeEach(() => {
    useCart.getState().clearCart();
    useCart.getState().addItem(mockCartItem);
  });

  it("should render item image, name, price and total sum", () => {
    render(<CartItemRow item={mockCartItem} />);

    expect(screen.getByText("Test Laptop")).toBeInTheDocument();
    
    // Итоговая сумма позиции: 50000 * 2 = 100000
    expect(screen.getByText("100 000 ₽")).toBeInTheDocument();
    
    // Цена за штуку
    expect(screen.getByText("50 000 ₽/шт.")).toBeInTheDocument();
  });

  it("should call updateQuantity to increment quantity on plus click", async () => {
    const user = userEvent.setup();
    render(<CartItemRow item={useCart.getState().items[0]} />);

    const plusButton = screen.getByRole("button", { name: "Увеличить количество" });
    await user.click(plusButton);

    // Проверяем, что в Zustand-хранилище количество стало 3
    expect(useCart.getState().items[0].quantity).toBe(3);
  });

  it("should disable plus button when quantity reaches stock", async () => {
    // Устанавливаем количество равное stock
    useCart.getState().updateQuantity("prod-1", 5);
    
    render(<CartItemRow item={useCart.getState().items[0]} />);

    const plusButton = screen.getByRole("button", { name: "Увеличить количество" });
    expect(plusButton).toBeDisabled();
  });

  it("should call updateQuantity to decrement quantity on minus click", async () => {
    const user = userEvent.setup();
    render(<CartItemRow item={useCart.getState().items[0]} />);

    const minusButton = screen.getByRole("button", { name: "Уменьшить количество" });
    await user.click(minusButton);

    // Проверяем, что количество в Zustand-сторе уменьшилось до 1
    expect(useCart.getState().items[0].quantity).toBe(1);
  });

  it("should remove item from store if quantity is 1 and minus click is performed", async () => {
    const user = userEvent.setup();
    
    // Устанавливаем количество в 1
    useCart.getState().updateQuantity("prod-1", 1);
    
    render(<CartItemRow item={useCart.getState().items[0]} />);

    const minusButton = screen.getByRole("button", { name: "Уменьшить количество" });
    await user.click(minusButton);

    // Товар должен полностью удалиться из корзины
    expect(useCart.getState().items).toHaveLength(0);
  });

  it("should call removeItem on trash icon click", async () => {
    const user = userEvent.setup();
    render(<CartItemRow item={useCart.getState().items[0]} />);

    const removeButton = screen.getByRole("button", { name: /Удалить Test Laptop из корзины/ });
    await user.click(removeButton);

    expect(useCart.getState().items).toHaveLength(0);
  });
});
