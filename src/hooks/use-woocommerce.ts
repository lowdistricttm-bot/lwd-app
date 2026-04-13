"use client";

import { useQuery } from '@tanstack/react-query';

const WC_URL = "https://www.lowdistrict.it/wp-json/wc/v3";
const CK = "ck_3d72f4e97f4b104d76bcf2f156d7f47b0e92af9b"; 
const CS = "cs_dfc8bfa35e29acf49067f1af13a98734142d2533";

const getAuthHeader = () => {
  return {
    'Authorization': 'Basic ' + btoa(`${CK}:${CS}`)
  };
};

export const useWcProducts = (params = "per_page=100") => {
  return useQuery({
    queryKey: ['wc-products', params],
    queryFn: async () => {
      const response = await fetch(`${WC_URL}/products?${params}`, {
        headers: getAuthHeader()
      });
      if (!response.ok) throw new Error('Errore caricamento prodotti');
      return response.json();
    }
  });
};

export const useWcCategories = () => {
  return useQuery({
    queryKey: ['wc-categories'],
    queryFn: async () => {
      const response = await fetch(`${WC_URL}/products/categories?hide_empty=true&per_page=100`, {
        headers: getAuthHeader()
      });
      if (!response.ok) throw new Error('Errore caricamento categorie');
      const data = await response.json();
      // Filtriamo per mostrare solo le categorie principali (parent === 0)
      return data.filter((cat: any) => cat.slug !== 'uncategorized' && cat.parent === 0);
    }
  });
};

export const useWcProduct = (id?: string) => {
  return useQuery({
    queryKey: ['wc-product', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`${WC_URL}/products/${id}`, {
        headers: getAuthHeader()
      });
      if (!response.ok) throw new Error('Prodotto non trovato');
      return response.json();
    },
    enabled: !!id
  });
};

export const useWcVariations = (productId?: number) => {
  return useQuery({
    queryKey: ['wc-variations', productId],
    queryFn: async () => {
      if (!productId) return [];
      const response = await fetch(`${WC_URL}/products/${productId}/variations`, {
        headers: getAuthHeader()
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!productId
  });
};

export const useWcUserOrders = (email?: string) => {
  return useQuery({
    queryKey: ['wc-orders', email],
    queryFn: async () => {
      if (!email) return [];
      const response = await fetch(`${WC_URL}/orders?customer=${email}`, {
        headers: getAuthHeader()
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!email
  });
};