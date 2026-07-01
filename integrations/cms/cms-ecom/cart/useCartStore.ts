import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Products } from '@/entities';

interface CartState {
  // State
  items: Products[];
  isOpen: boolean;
  isLoading: boolean;
  addingItemId: string | null;
  isCheckingOut: boolean;
  error: string | null;

  // Internal
  _initialized: boolean;
}

interface CartActions {
  // Public actions
  addToCart: (input: Products) => Promise<void>;
  removeFromCart: (item: Products) => void;
  updateQuantity: (item: Products, quantity: number) => void;
  clearCart: () => void;
  checkout: () => Promise<void>;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Internal
  _fetchCart: () => Promise<void>;
  _sendQuantityUpdate: (lineItemId: string, quantity: number) => Promise<void>;
}

type CartStore = CartState & { actions: CartActions };

/** Convert Wix cart line item to our CartItem format */
const mapLineItemToCartItem = (lineItem: Products): Products | null => {
  if (!lineItem._id) return null;

  return lineItem;
};

/**
 * Zustand store for cart state and actions.
 * No provider needed - just import and use anywhere.
 */
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isOpen: false,
      isLoading: false,
      addingItemId: null,
      isCheckingOut: false,
      error: null,
      _initialized: false,

      actions: {
        /** Fetch cart - Load from localStorage handled by persist */
        _fetchCart: async () => {
          set({ _initialized: true });
        },

        /** Add item to cart - Local storage first */
        addToCart: async (input: Products, isOpen: boolean = true) => {
          set({ addingItemId: input._id, error: null });
          const { items } = get();
          const existingItem = items.find((i) => i._id === input._id);

          let newItems: Products[];
          if (existingItem) {
            newItems = items.map((i) =>
              i._id === input._id
                ? { ...i, quantity: i.quantity + (input.quantity || 1) }
                : i
            );
          } else {
            newItems = [
              ...items,
              input,
            ];
          }

          set({ items: newItems, addingItemId: null, isOpen: isOpen });
          if (typeof document !== 'undefined') {
            document.body.style.overflow = isOpen ? 'hidden': '';
          }
        },

        /** Remove item from cart - Local update */
        removeFromCart: (item: Products) => {
          set({ items: get().items.filter((i) => i._id !== item._id) });
        },

        /** Update quantity - Local update */
        updateQuantity: (item: Products, quantity: number) => {
          const { items } = get();
          if (quantity <= 0) {
            set({ items: items.filter((i) => i._id !== item._id) });
          } else {
            set({
              items: items.map((i) => (i._id === item._id ? { ...i, quantity } : i)),
            });
          }
        },

        /** Internal: No-op for local-first cart */
        _sendQuantityUpdate: async () => {},

        /** Clear all items from cart */
        clearCart: () => {
          set({ items: [] });
        },

        /** Checkout - Sync local cart to Wix server before redirecting */
        checkout: async () => {
          set({ isCheckingOut: true, error: null });
          const { items } = get();

          if (items.length === 0) {
            set({ isCheckingOut: false, error: 'Cart is empty' });
            return;
          }

          set({
            isCheckingOut: true,
            error: null,
          });
        },
        /** Toggle cart drawer */
        toggleCart: () => {
          const nextState = !get().isOpen;
          set({ isOpen: nextState });
          if (typeof document !== 'undefined') {
            document.body.style.overflow = nextState ? 'hidden' : '';
          }
        },

        /** Open cart drawer */
        openCart: () => {
          set({ isOpen: true });
          if (typeof document !== 'undefined') {
            document.body.style.overflow = 'hidden';
          }
        },

        /** Close cart drawer */
        closeCart: () => {
          set({ isOpen: false });
          if (typeof document !== 'undefined') {
            document.body.style.overflow = '';
          }
        },
      },
    }),
    {
      name: 'esc-cart-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist essential data
      partialize: (state) => ({
        items: state.items,
        isOpen: state.isOpen,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.actions._fetchCart();
          // Đồng bộ lại trạng thái scroll sau khi nạp dữ liệu từ localStorage
          if (typeof document !== 'undefined') {
            document.body.style.overflow = state.isOpen ? 'hidden' : '';
          }
        }
      },
    }
  )
);

export const useCart = (lang: string) => {
  const store = useCartStore();

  // Auto-fetch cart on first use
  if (!store._initialized && !store.isLoading) {
    store.actions._fetchCart();
  }

  // Computed values
  const itemCount = store.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = store.items.reduce((sum, item) => sum + item.itemPrice[lang] * item.quantity, 0);

  return {
    // State
    items: store.items,
    itemCount,
    totalPrice,
    isOpen: store.isOpen,
    isLoading: store.isLoading,
    addingItemId: store.addingItemId,
    isCheckingOut: store.isCheckingOut,
    error: store.error,
    // Actions
    actions: store.actions,
  };
};