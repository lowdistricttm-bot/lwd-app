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

export const useWcUserOrders = (email?: string, wpId?: string) => {
  return useQuery({
    queryKey: ['wc-orders', email, wpId],
    queryFn: async () => {
      if (!email && !wpId) return [];
      
      try {
        const ordersMap = new Map();

        // 1. Ricerca per ID Cliente (Ordini fatti dall'app o account collegati)
        if (wpId) {
          const idResponse = await fetch(`${WC_URL}/orders?customer=${wpId}&per_page=50`, {
            headers: getWcAuthHeader()
          });
          if (idResponse.ok) {
            const idOrders = await idResponse.json();
            idOrders.forEach((o: any) => ordersMap.set(o.id, o));
          }
        }

        // 2. Ricerca per Email (Ordini fatti dal sito web)
        if (email) {
          const emailResponse = await fetch(`${WC_URL}/orders?search=${encodeURIComponent(email)}&per_page=50`, {
            headers: getWcAuthHeader()
          });
          if (emailResponse.ok) {
            const emailOrders = await emailResponse.json();
            emailOrders.forEach((o: any) => {
              // Verifichiamo che l'email corrisponda effettivamente (la ricerca search è ampia)
              if (o.billing.email.toLowerCase() === email.toLowerCase()) {
                ordersMap.set(o.id, o);
              }
            });
          }
        }

        // Convertiamo la mappa in array e ordiniamo per data decrescente
        return Array.from(ordersMap.values()).sort((a, b) => 
          new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
        );
      } catch (err) {
        console.error("Errore recupero ordini:", err);
        return [];
      }
    },
    enabled: !!email || !!wpId,
    staleTime: 0
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

export const useWcShippingMethods = () => {
  return useQuery({
    queryKey: ['wc-shipping-methods'],
    queryFn: async () => {
      const zonesResponse = await fetch(`${WC_URL}/shipping/zones`, {
        headers: getWcAuthHeader()
      });
      if (!zonesResponse.ok) throw new Error('Errore caricamento zone di spedizione');
      const zones = await zonesResponse.json();

      const zoneId = zones[0]?.id || 0;
      const methodsResponse = await fetch(`${WC_URL}/shipping/zones/${zoneId}/methods`, {
        headers: getWcAuthHeader()
      });
      if (!methodsResponse.ok) throw new Error('Errore caricamento metodi di spedizione');
      return methodsResponse.json();
    }
  });
};