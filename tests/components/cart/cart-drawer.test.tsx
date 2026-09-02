import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { useCart } from "@/hooks/use-cart";

const mockItems = [
  { productId: "prod-1", name: "Test Laptop", price: 50000, image: "/images/laptop.jpg", stock: 5, quantity: 1 },
  { productId: "prod-2", name: "Test Mouse", price: 2000, image: "/images/mouse.jpg", stock: 10, quantity: 2 },
];

describe("CartDrawer Component", () => {
  beforeEach(() => {
    useCart.getState().clearCart();
    useCart.getState().closeCart();
  });

  it("should show empty cart message when no items are present", () => {
    useCart.getState().openCart();
    render(<CartDrawer />);

    expect(screen.getByText("Ваша корзина пуста")).toBeInTheDocument();
    expect(screen.getByText("Выберите девайсы и аксессуары в каталоге, чтобы оформить заказ.")).toBeInTheDocument();
  });

  it("should render a list of cart items and total calculations", () => {
    useCart.getState().openCart();
    mockItems.forEach((item) => useCart.getState().addItem(item));

    render(<CartDrawer />);

    expect(screen.getByText("Test Laptop")).toBeInTheDocument();
    expect(screen.getByText("Test Mouse")).toBeInTheDocument();

    // Суммарный счетчик товаров: 1 + 2 = 3
    expect(screen.getByText("3")).toBeInTheDocument();

    // Общая стоимость: 50000*1 + 2000*2 = 54000
    expect(screen.getByText(/54 000/)).toBeInTheDocument();
  });

  it("should clear the cart when clicking 'Очистить корзину'", async () => {
    const user = userEvent.setup();
    useCart.getState().openCart();
    mockItems.forEach((item) => useCart.getState().addItem(item));

    render(<CartDrawer />);

    const clearButton = screen.getByRole("button", { name: "Очистить корзину" });
    await user.click(clearButton);

    expect(useCart.getState().items).toHaveLength(0);
    expect(screen.getByText("Ваша корзина пуста")).toBeInTheDocument();
  });

  it("should close the drawer when clicking close button", async () => {
    const user = userEvent.setup();
    useCart.getState().openCart();
    render(<CartDrawer />);

    const closeButton = screen.getByRole("button", { name: "Закрыть корзину" });
    await user.click(closeButton);

    expect(useCart.getState().isOpen).toBe(false);
  });
});
