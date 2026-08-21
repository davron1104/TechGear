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
