import { useQuery } from "@tanstack/react-query";
import { wcFetch } from "@/lib/woocommerce";

const DEFAULT_QUERY_OPTIONS = {
  staleTime: 1000 * 60 * 5,
  gcTime: 1000 * 60 * 30,
};

export const useWcProducts = (params?: string) => {
  return useQuery({
    queryKey: ['wc-products', params],
    queryFn: () => wcFetch(`/products?per_page=40${params ? `&${params}` : ''}`),
    ...DEFAULT_QUERY_OPTIONS,
  });
};

// Hook per recuperare gli eventi ufficiali (prodotti in categoria eventi)
export const useWcEvents = () => {
  return useQuery({
    queryKey: ['wc-events'],
    queryFn: () => wcFetch('/products?category=31'), // ID categoria eventi sul tuo sito
    ...DEFAULT_QUERY_OPTIONS,
  });
};

// Hook per recuperare le selezioni/ordini dell'utente loggato
export const useWcUserOrders = (customerId: number | undefined) => {
  return useQuery({
    queryKey: ['wc-user-orders', customerId],
    queryFn: () => wcFetch(`/orders?customer=${customerId}`),
    enabled: !!customerId,
    ...DEFAULT_QUERY_OPTIONS,
  });
};

export const useWcCategories = () => {
  return useQuery({
    queryKey: ['wc-categories'],
    queryFn: () => wcFetch('/products/categories?per_page=100&hide_empty=true'),
    ...DEFAULT_QUERY_OPTIONS,
  });
};

export const useWcTags = () => {
  return useQuery({
    queryKey: ['wc-tags'],
    queryFn: () => wcFetch('/products/tags?per_page=100&hide_empty=true'),
    ...DEFAULT_QUERY_OPTIONS,
  });
};

export const useWcProduct = (id: string | undefined) => {
  return useQuery({
    queryKey: ['wc-product', id],
    queryFn: () => wcFetch(`/products/${id}`),
    enabled: !!id,
    ...DEFAULT_QUERY_OPTIONS,
  });
};

export const useWcCustomerCount = () => {
  return useQuery({
    queryKey: ['wc-customer-count'],
    queryFn: async () => {
      const response = await fetch('https://www.lowdistrict.it/wp-json/wc/v3/customers?per_page=1', {
        headers: {
          'Authorization': `Basic ${btoa("ck_9fb51bb84b02dbc2bbc4c9a602de478ca33079ea:cs_225bea698a3c9bf46cda04bf57a630a6b15034a9")}`
        }
      });
      return response.headers.get('X-WP-Total') || "0";
    },
    ...DEFAULT_QUERY_OPTIONS,
  });
};