import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { CART_STORAGE_KEY } from '@/mocks/reset-demo';
import { multiplyMoney, sumMoney } from '@/shared/lib/decimal';

export type CartItem = {
  productId: string;
  name: string;
  sku: string;
  unitPrice: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  getSubtotal: () => string;
  getTotalItems: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        if (quantity < 1) {
          return;
        }

        set((state) => {
          const existing = state.items.find(
            (candidate) => candidate.productId === item.productId,
          );
          if (existing) {
            return {
              items: state.items.map((candidate) =>
                candidate.productId === item.productId
                  ? { ...candidate, quantity: candidate.quantity + quantity }
                  : candidate,
              ),
            };
          }

          return {
            items: [...state.items, { ...item, quantity }],
          };
        });
      },
      setQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
        }));
      },
      increment: (productId) => {
        const item = get().items.find(
          (candidate) => candidate.productId === productId,
        );
        if (item) {
          get().setQuantity(productId, item.quantity + 1);
        }
      },
      decrement: (productId) => {
        const item = get().items.find(
          (candidate) => candidate.productId === productId,
        );
        if (item) {
          get().setQuantity(productId, item.quantity - 1);
        }
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },
      clear: () => set({ items: [] }),
      getSubtotal: () =>
        sumMoney(
          get().items.map((item) =>
            multiplyMoney(item.unitPrice, item.quantity),
          ),
        ),
      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    {
      name: CART_STORAGE_KEY,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
