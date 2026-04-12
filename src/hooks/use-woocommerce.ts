import { useQuery } from "@tanstack/react-query";
import { wcFetch } from "@/lib/woocommerce";

// Aggiungiamo staleTime e gcTime per mantenere i dati in memoria più a lungo
const DEFAULT_QUERY_OPTIONS = {
  staleTime: 1000 * 60 * 5, // 5 minuti
  gcTime: 1000 * 60 * 30, // 30 minuti
};

export const useWcProducts = (params?: string) => {
  return useQuery({
    queryKey: ['wc-products', params],
    queryFn: () => wcFetch(`/products?per_page=40${params ? `&${params}` : ''}`),
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