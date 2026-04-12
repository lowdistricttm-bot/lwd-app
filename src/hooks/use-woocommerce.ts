import { useQuery } from "@tanstack/react-query";
import { wcFetch } from "@/lib/woocommerce";

export const useWcProducts = (params?: string) => {
  return useQuery({
    queryKey: ['wc-products', params],
    queryFn: () => wcFetch(`/products?per_page=100${params ? `&${params}` : ''}`),
  });
};

export const useWcCategories = () => {
  return useQuery({
    queryKey: ['wc-categories'],
    queryFn: () => wcFetch('/products/categories?per_page=100&hide_empty=true'),
  });
};

export const useWcProduct = (id: string | undefined) => {
  return useQuery({
    queryKey: ['wc-product', id],
    queryFn: () => wcFetch(`/products/${id}`),
    enabled: !!id,
  });
};