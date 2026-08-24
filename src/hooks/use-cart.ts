import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartStore, CartItem } from "@/types/cart";
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearServerCart,
  mergeCart,
} from "@/actions/cart-actions";

// Sequence counter to prevent stale background syncWithServer responses from overwriting user mutations
let globalSyncSequence = 0;

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,
      isAuthenticated: false,

      setIsAuthenticated: (status) => {
        set({ isAuthenticated: status });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      setItems: (items) => {
        set({ items });
      },

      addItem: async (newItem) => {
        const { items, isAuthenticated } = get();
        const existingItem = items.find(
          (item) => item.productId === newItem.productId
        );
        const addQty = newItem.quantity ?? 1;

        if (isAuthenticated) {
          // Invalidate any in-flight background sync
          ++globalSyncSequence;

          // Optimistic local update for instantaneous UI feedback
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

          // Server Action call
          const res = await addToCart({
            productId: newItem.productId,
            quantity: addQty,
          });

          // Always apply successful server response from direct user mutation
          if (res.success) {
            set({ items: res.data });
          } else {
            // Roll back with authoritative server state
            await get().syncWithServer();
          }
        } else {
          // Guest local update
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
        }
      },

      removeItem: async (productId) => {
        const { isAuthenticated } = get();
        ++globalSyncSequence;

        // Optimistic local update
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });

        if (isAuthenticated) {
          const res = await removeFromCart(productId);
          if (res.success) {
            set({ items: res.data });
          } else {
            await get().syncWithServer();
          }
        }
      },

      updateQuantity: async (productId, quantity) => {
        const { isAuthenticated } = get();
        ++globalSyncSequence;

        if (quantity <= 0) {
          await get().removeItem(productId);
          return;
        }

        const { items } = get();
        // Optimistic local update
        set({
          items: items.map((item) => {
            if (item.productId === productId) {
              const maxStock = item.stock ?? 999;
              return { ...item, quantity: Math.min(quantity, maxStock) };
            }
            return item;
          }),
        });

        if (isAuthenticated) {
          const res = await updateCartItemQuantity({ productId, quantity });
          if (res.success) {
            set({ items: res.data });
          } else {
            await get().syncWithServer();
          }
        }
      },

      clearCart: async () => {
        const { isAuthenticated } = get();
        ++globalSyncSequence;
        set({ items: [] });

        if (isAuthenticated) {
          await clearServerCart();
        }
      },

      syncWithServer: async () => {
        const currentSeq = ++globalSyncSequence;
        set({ isLoading: true });
        try {
          const res = await getCart();
          if (currentSeq === globalSyncSequence) {
            if (res.success) {
              set({ items: res.data, isLoading: false });
            } else {
              set({ isLoading: false });
            }
          }
        } catch (err) {
          console.error("Failed to sync cart with server:", err);
          if (currentSeq === globalSyncSequence) {
            set({ isLoading: false });
          }
        }
      },

      mergeGuestCart: async (explicitGuestItems?: CartItem[]) => {
        const guestItems = explicitGuestItems ?? get().items;
        if (guestItems.length === 0) {
          await get().syncWithServer();
          return;
        }

        const currentSeq = ++globalSyncSequence;
        set({ isLoading: true });
        try {
          const payload = guestItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          }));

          const res = await mergeCart(payload);
          if (currentSeq === globalSyncSequence) {
            if (res.success) {
              set({ items: res.data, isLoading: false });
              // Clean up guest local storage so it will never re-merge
              if (typeof window !== "undefined") {
                localStorage.removeItem("techgear-guest-cart");
              }
            } else {
              await get().syncWithServer();
            }
          }
        } catch (err) {
          console.error("Failed to merge guest cart with server:", err);
          if (currentSeq === globalSyncSequence) {
            await get().syncWithServer();
          }
        }
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
      // ONLY persist items to localStorage when the user is a guest.
      // Authenticated users' carts live on the PostgreSQL server to prevent re-merging on reload.
      partialize: (state) => {
        if (state.isAuthenticated) {
          return { items: [] };
        }
        return { items: state.items };
      },
    }
  )
);
