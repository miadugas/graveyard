import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartState {
  items: Record<string, number>;
  addItem: (id: string) => void;
  decrementItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: {},
      addItem: (id) =>
        set((state) => ({
          items: {
            ...state.items,
            [id]: (state.items[id] ?? 0) + 1
          }
        })),
      decrementItem: (id) =>
        set((state) => {
          const next = (state.items[id] ?? 0) - 1;
          if (next <= 0) {
            const rest = { ...state.items };
            delete rest[id];
            return { items: rest };
          }

          return {
            items: {
              ...state.items,
              [id]: next
            }
          };
        }),
      clearCart: () => set({ items: {} })
    }),
    {
      name: "grave-goods-cart"
    }
  )
);
