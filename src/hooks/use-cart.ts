"use client";

import { useState, useEffect } from 'react';
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

// Sistema di gestione stato semplice (Vanilla JS)
let cartItems: CartItem[] = JSON.parse(localStorage.getItem('low-district-cart') || '[]');
const listeners = new Set<Function>();

const notify = () => listeners.forEach(l => l([...cartItems]));

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>(cartItems);

  useEffect(() => {
    listeners.add(setItems);
    return () => { listeners.delete(setItems); };
  }, []);

  const addToCart = (newItem: CartItem) => {
    const existingItem = cartItems.find(i => i.id === newItem.id && i.variationId === newItem.variationId);
    
    if (existingItem) {
      cartItems = cartItems.map(i => 
        (i.id === newItem.id && i.variationId === newItem.variationId) 
          ? { ...i, quantity: i.quantity + 1 } 
          : i
      );
    } else {
      cartItems = [...cartItems, newItem];
    }
    
    saveAndNotify();
    showSuccess("Aggiunto al carrello!");
  };

  const updateQuantity = (id: number, variationId: number | undefined, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    cartItems = cartItems.map(i => 
      (i.id === id && i.variationId === variationId) 
        ? { ...i, quantity: newQuantity } 
        : i
    );
    saveAndNotify();
  };

  const removeFromCart = (id: number, variationId?: number) => {
    cartItems = cartItems.filter(i => !(i.id === id && i.variationId === variationId));
    saveAndNotify();
  };

  const clearCart = () => {
    cartItems = [];
    saveAndNotify();
  };

  const saveAndNotify = () => {
    localStorage.setItem('low-district-cart', JSON.stringify(cartItems));
    notify();
  };

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return { items, addToCart, updateQuantity, removeFromCart, clearCart, total };
};