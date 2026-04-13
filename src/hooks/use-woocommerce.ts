"use client";

import { useQuery } from '@tanstack/react-query';

const WC_URL = "https://www.lowdistrict.it/wp-json/wc/v3";
// Inseriremo qui le chiavi appena disponibili
const CK = ""; 
const CS = "";

const getAuthHeader = () => {
  if (!CK || !CS) return {};
  return {
    'Authorization': 'Basic ' + btoa(`${CK}:${CS}`)
  };
};

export const useWcProducts = (params = "") => {
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