"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { showSuccess } from '@/utils/toast';

interface CartItem {
  id: number;
  variationId?: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
}

interface CartStore {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number, variationId?: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      addToCart: (newItem) => {
        const items = get().items;
        const existingItem = items.find(i => i.id === newItem.id && i.variationId === newItem.variationId);
        
        let newItems;
        if (existingItem) {
          newItems = items.map(i => 
            (i.id === newItem.id && i.variationId === newItem.variationId) 
              ? { ...i, quantity: i.quantity + 1 } 
              : i
          );
        } else {
          newItems = [...items, newItem];
        }
        
        const total = newItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        set({ items: newItems, total });
        showSuccess("Aggiunto al carrello!");
      },
      removeFromCart: (id, variationId) => {
        const newItems = get().items.filter(i => !(i.id === id && i.variationId === variationId));
        const total = newItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        set({ items: newItems, total });
      },
      clearCart: () => set({ items: [], total: 0 }),
    }),
    { name: 'low-district-cart' }
  )
);