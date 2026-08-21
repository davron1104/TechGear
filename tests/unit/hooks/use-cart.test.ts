import { describe, it, expect, beforeEach } from "vitest";
import { useCart } from "@/hooks/use-cart";

describe("useCart Zustand Store", () => {
  beforeEach(() => {
    // Очищаем корзину перед каждым тестом
    useCart.getState().clearCart();
    useCart.getState().closeCart();
  });

  it("should have initial empty state", () => {
    const state = useCart.getState();
    expect(state.items).toEqual([]);
    expect(state.isOpen).toBe(false);
  });

  it("should toggle, open, and close cart", () => {
    // Изначально закрыта
    expect(useCart.getState().isOpen).toBe(false);

    // Открываем
    useCart.getState().openCart();
    expect(useCart.getState().isOpen).toBe(true);

    // Закрываем
    useCart.getState().closeCart();
    expect(useCart.getState().isOpen).toBe(false);

    // Переключаем
    useCart.getState().toggleCart();
    expect(useCart.getState().isOpen).toBe(true);
    useCart.getState().toggleCart();
    expect(useCart.getState().isOpen).toBe(false);
  });

  it("should add a new item with quantity 1 by default", () => {
    const mockProduct = {
      productId: "prod-1",
      name: "Test Laptop",
      price: 50000,
      image: "/images/laptop.jpg",
      stock: 5,
    };

    useCart.getState().addItem(mockProduct);

    const items = useCart.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({
      productId: "prod-1",
      name: "Test Laptop",
      price: 50000,
      image: "/images/laptop.jpg",
      quantity: 1,
      stock: 5,
    });
  });

  it("should add a new item with custom quantity", () => {
    const mockProduct = {
      productId: "prod-1",
      name: "Test Laptop",
      price: 50000,
      image: "/images/laptop.jpg",
      stock: 5,
      quantity: 3,
    };

    useCart.getState().addItem(mockProduct);

    const items = useCart.getState().items;
    expect(items[0].quantity).toBe(3);
  });

  it("should increase quantity when adding existing item", () => {
    const mockProduct = {
      productId: "prod-1",
      name: "Test Laptop",
      price: 50000,
      image: "/images/laptop.jpg",
      stock: 5,
      quantity: 1,
    };

    useCart.getState().addItem(mockProduct);
    useCart.getState().addItem({ ...mockProduct, quantity: 2 });

    const items = useCart.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3); // 1 + 2
  });

  it("should respect stock limits when adding items", () => {
    const mockProduct = {
      productId: "prod-1",
      name: "Test Laptop",
      price: 50000,
      image: "/images/laptop.jpg",
      stock: 3, // лимит 3 шт.
      quantity: 1,
    };

    // Добавляем 1 штуку
    useCart.getState().addItem(mockProduct);
    // Пробуем добавить еще 5 штук (итого 6, но stock = 3)
    useCart.getState().addItem({ ...mockProduct, quantity: 5 });

    const items = useCart.getState().items;
    expect(items[0].quantity).toBe(3); // Ограничено по stock
  });

  it("should respect stock limits on initial add", () => {
    const mockProduct = {
      productId: "prod-1",
      name: "Test Laptop",
      price: 50000,
      image: "/images/laptop.jpg",
      stock: 2,
      quantity: 5, // Просим 5, но доступно 2
    };

    useCart.getState().addItem(mockProduct);

    const items = useCart.getState().items;
    expect(items[0].quantity).toBe(2);
  });

  it("should remove item from cart", () => {
    const item1 = { productId: "prod-1", name: "Laptop", price: 50000, image: "", stock: 5, quantity: 1 };
    const item2 = { productId: "prod-2", name: "Mouse", price: 2000, image: "", stock: 10, quantity: 1 };

    useCart.getState().addItem(item1);
    useCart.getState().addItem(item2);

    expect(useCart.getState().items).toHaveLength(2);

    useCart.getState().removeItem("prod-1");

    const items = useCart.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe("prod-2");
  });

  it("should update quantity of existing item", () => {
    const mockProduct = { productId: "prod-1", name: "Laptop", price: 50000, image: "", stock: 5, quantity: 1 };
    useCart.getState().addItem(mockProduct);

    useCart.getState().updateQuantity("prod-1", 4);
    expect(useCart.getState().items[0].quantity).toBe(4);
  });

  it("should limit updated quantity to stock", () => {
    const mockProduct = { productId: "prod-1", name: "Laptop", price: 50000, image: "", stock: 3, quantity: 1 };
    useCart.getState().addItem(mockProduct);

    useCart.getState().updateQuantity("prod-1", 10);
    expect(useCart.getState().items[0].quantity).toBe(3); // Ограничено до stock
  });

  it("should remove item if updated quantity is 0 or negative", () => {
    const mockProduct = { productId: "prod-1", name: "Laptop", price: 50000, image: "", stock: 5, quantity: 1 };
    useCart.getState().addItem(mockProduct);

    useCart.getState().updateQuantity("prod-1", 0);
    expect(useCart.getState().items).toHaveLength(0);
  });

  it("should calculate total count and total price correctly", () => {
    const item1 = { productId: "prod-1", name: "Laptop", price: 50000, image: "", stock: 5, quantity: 2 };
    const item2 = { productId: "prod-2", name: "Mouse", price: 2000, image: "", stock: 10, quantity: 3 };

    useCart.getState().addItem(item1);
    useCart.getState().addItem(item2);

    expect(useCart.getState().getTotalCount()).toBe(5); // 2 + 3
    expect(useCart.getState().getTotalPrice()).toBe(106000); // 50000*2 + 2000*3
  });
});
