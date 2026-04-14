"use client";

import { useQuery, useMutation } from '@tanstack/react-query';

const WC_URL = "https://www.lowdistrict.it/wp-json/wc/v3";
const CK = "ck_3d72f4e97f4b104d76bcf2f156d7f47b0e92af9b"; 
const CS = "cs_dfc8bfa35e29acf49067f1af13a98734142d2533";

const getWcAuthHeader = () => {
  return {
    'Authorization': 'Basic ' + btoa(`${CK}:${CS}`),
    'Content-Type': 'application/json'
  };
};

export const useWcProducts = (params = "per_page=100") => {
  return useQuery({
    queryKey: ['wc-products', params],
    queryFn: async () => {
      const response = await fetch(`${WC_URL}/products?${params}`, {
        headers: getWcAuthHeader()
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
        headers: getWcAuthHeader()
      });
      if (!response.ok) throw new Error('Errore caricamento categorie');
      const data = await response.json();
      return data.filter((cat: any) => cat.slug !== 'uncategorized');
    }
  });
};

export const useWcProduct = (id?: string) => {
  return useQuery({
    queryKey: ['wc-product', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`${WC_URL}/products/${id}`, {
        headers: getWcAuthHeader()
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
        headers: getWcAuthHeader()
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
      const customerResponse = await fetch(`${WC_URL}/customers?email=${encodeURIComponent(email)}`, {
        headers: getWcAuthHeader()
      });
      if (!customerResponse.ok) return [];
      const customerData = await customerResponse.json();
      const customerId = customerData[0]?.id;
      if (!customerId) return [];
      const ordersResponse = await fetch(`${WC_URL}/orders?customer=${customerId}`, {
        headers: getWcAuthHeader()
      });
      if (!ordersResponse.ok) return [];
      return ordersResponse.json();
    },
    enabled: !!email
  });
};

export const useWcCreateOrder = () => {
  return useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch(`${WC_URL}/orders`, {
        method: 'POST',
        headers: getWcAuthHeader(),
        body: JSON.stringify(orderData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Errore durante la creazione dell\'ordine');
      }
      return response.json();
    }
  });
};