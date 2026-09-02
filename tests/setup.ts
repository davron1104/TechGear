import "@testing-library/jest-dom";
import { vi } from "vitest";

// Мок для Next.js navigation
vi.mock("next/navigation", () => {
  const router = {
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  };

  return {
    useRouter: () => router,
    usePathname: () => "",
    useSearchParams: () => new URLSearchParams(),
  };
});

// Мок для cart-actions (Server Actions)
vi.mock("@/actions/cart-actions", () => ({
  getCart: vi.fn().mockResolvedValue({ success: true, data: { items: [] } }),
  addToCart: vi.fn().mockResolvedValue({ success: true, data: { items: [] } }),
  updateCartItemQuantity: vi.fn().mockResolvedValue({ success: true, data: { items: [] } }),
  removeFromCart: vi.fn().mockResolvedValue({ success: true, data: { items: [] } }),
  clearServerCart: vi.fn().mockResolvedValue({ success: true, data: { items: [] } }),
  mergeCart: vi.fn().mockResolvedValue({ success: true, data: { items: [] } }),
}));

// Мок для NextAuth
vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  useSession: vi.fn().mockReturnValue({ data: null, status: "unauthenticated" }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Дополнительные глобальные моки браузерной среды, если потребуется
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Устарело
    removeListener: vi.fn(), // Устарело
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
