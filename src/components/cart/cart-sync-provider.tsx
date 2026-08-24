"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/hooks/use-cart";
import { CartItem } from "@/types/cart";

export function CartSyncProvider() {
  const { data: session, status } = useSession();
  const setIsAuthenticated = useCart((state) => state.setIsAuthenticated);
  const syncWithServer = useCart((state) => state.syncWithServer);
  const mergeGuestCart = useCart((state) => state.mergeGuestCart);

  const isSyncingRef = useRef(false);
  const lastSyncedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session?.user?.id) {
      const currentUserId = session.user.id;

      // Prevent duplicate merge/sync on re-renders or tab switches for the same session
      if (lastSyncedUserIdRef.current === currentUserId || isSyncingRef.current) {
        return;
      }

      isSyncingRef.current = true;
      lastSyncedUserIdRef.current = currentUserId;

      // 1. СНАЧАЛА читаем гостевые товары из localStorage ДО установки флага isAuthenticated,
      // чтобы persist partialize не перезаписал их пустым массивом
      let guestItems: CartItem[] = [];
      try {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("techgear-guest-cart");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed?.state?.items) && parsed.state.items.length > 0) {
              guestItems = parsed.state.items;
            }
          }
        }
      } catch (err) {
        console.error("Error reading guest cart from localStorage:", err);
        guestItems = [];
      }

      // Если в localStorage пусто, но в Zustand ещё остались гостевые элементы до смены флага
      if (guestItems.length === 0 && !useCart.getState().isAuthenticated) {
        guestItems = useCart.getState().items;
      }

      // 2. Устанавливаем статус авторизованного пользователя
      setIsAuthenticated(true);

      // 3. Выполняем слияние или обычную синхронизацию с сервером
      const runSync = async () => {
        try {
          if (guestItems.length > 0) {
            // Реальная гостевая корзина существовала до авторизации -> выполняем слияние
            await mergeGuestCart(guestItems);
          } else {
            // Обычное обновление страницы (F5) или пустая корзина -> загружаем данные из БД
            await syncWithServer();
          }
        } catch (error) {
          console.error("Cart synchronization error:", error);
        } finally {
          isSyncingRef.current = false;
        }
      };

      runSync();
    } else if (status === "unauthenticated") {
      // Пользователь вышел из аккаунта: сбрасываем флаг и очищаем стейт в памяти,
      // чтобы серверная корзина не оставалась у гостя
      if (useCart.getState().isAuthenticated) {
        setIsAuthenticated(false);
        useCart.getState().setItems([]);
      }
      lastSyncedUserIdRef.current = null;
      isSyncingRef.current = false;
    }
  }, [status, session?.user?.id, setIsAuthenticated, syncWithServer, mergeGuestCart]);

  return null;
}
