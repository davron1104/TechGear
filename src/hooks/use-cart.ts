import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartStore } from "@/types/cart";

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      addItem: (newItem) => {
        const { items } = get();
        const existingItem = items.find(
          (item) => item.productId === newItem.productId
        );
        const addQty = newItem.quantity ?? 1;

        if (existingItem) {
          const maxStock = newItem.stock ?? existingItem.stock ?? 999;
          const nextQty = Math.min(existingItem.quantity + addQty, maxStock);

          set({
            items: items.map((item) =>
              item.productId === newItem.productId
                ? { ...item, quantity: nextQty }
                : item
            ),
          });
        } else {
          const initialQty = Math.min(addQty, newItem.stock ?? 999);
          set({
            items: [
              ...items,
              {
                productId: newItem.productId,
                name: newItem.name,
                price: newItem.price,
                image: newItem.image,
                quantity: initialQty,
                stock: newItem.stock,
              },
            ],
          });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const { items } = get();
        set({
          items: items.map((item) => {
            if (item.productId === productId) {
              const maxStock = item.stock ?? 999;
              return { ...item, quantity: Math.min(quantity, maxStock) };
            }
            return item;
          }),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "techgear-guest-cart",
      storage: createJSONStorage(() => localStorage),
      // Сохраняем в localStorage только список items, исключая UI-состояние isOpen
      partialize: (state) => ({ items: state.items }),
    }
  )
);
