/**
 * Минимальный TypeScript-контракт для элементов корзины и Zustand-хранилища
 */

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number;
}

export interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  setIsAuthenticated: (status: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setItems: (items: CartItem[]) => void;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void | Promise<void>;
  removeItem: (productId: string) => void | Promise<void>;
  updateQuantity: (productId: string, quantity: number) => void | Promise<void>;
  clearCart: () => void | Promise<void>;
  syncWithServer: () => Promise<void>;
  mergeGuestCart: (explicitGuestItems?: CartItem[]) => Promise<void>;
  getTotalCount: () => number;
  getTotalPrice: () => number;
}
