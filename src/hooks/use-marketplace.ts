"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from 'react';
import { showError, showSuccess } from '@/utils/toast';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { compressImage } from '@/utils/media';

export interface MarketplaceItem {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  status?: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
}

export interface SellerReview {
  id: string;
  seller_id: string;
  reviewer_id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer?: {
    username: string;
    avatar_url: string;
  };
}

export const MARKETPLACE_CATEGORIES = [
  { id: 'wheels', label: 'Cerchi' },
  { id: 'interior', label: 'Interni' },
  { id: 'exterior', label: 'Esterni' },
  { id: 'performance', label: 'Performance' },
  { id: 'cars', label: 'Auto Complete' },
  { id: 'other', label: 'Altro' }
];

export const useMarketplace = (categoryFilter: string = 'all') => {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: ['marketplace-items', categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from('marketplace_items')
        .select(`
          id, seller_id, title, description, price, category, images, status, created_at,
          profiles:seller_id (
            username, 
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;
      
      if (error) {
        if (error.message?.includes('AbortError') || error.message?.includes('Lock broken')) {
          return [];
        }
        console.error("[Marketplace] Errore query:", error);
        return [];
      }
      
      return (data || []).map((item: any) => ({
        ...item,
        profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
      })) as MarketplaceItem[];
    },
    staleTime: 1000 * 60 * 5
  });

  useEffect(() => {
    const channelId = `marketplace-${Math.random().toString(36).substring(2, 9)}`;
    
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'marketplace_items' }, 
        () => {
          queryClient.invalidateQueries({ queryKey: ['marketplace-items'] });
        }
      )
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [queryClient]);

  const createItem = useMutation({
    mutationFn: async (data: { title: string, description: string, price: number, category: string, files: File[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per pubblicare");

      const imageUrls: string[] = [];
      for (const file of data.files) {
        const compressed = await compressImage(file);
        const url = await uploadToCloudinary(compressed);
        imageUrls.push(url);
      }

      const { error } = await supabase
        .from('marketplace_items')
        .insert([{
          seller_id: user.id,
          title: data.title,
          description: data.description,
          price: data.price,
          category: data.category,
          images: imageUrls,
          status: 'active'
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-items'] });
      queryClient.invalidateQueries({ queryKey: ['user-marketplace-items'] });
      showSuccess("Annuncio pubblicato!");
    },
    onError: (err: any) => showError(err.message)
  });

  const updateItem = useMutation({
    mutationFn: async (data: { id: string, title: string, description: string, price: number, category: string, files?: File[], existingImages?: string[] }) => {
      let imageUrls = data.existingImages || [];
      
      if (data.files && data.files.length > 0) {
        const newUrls: string[] = [];
        for (const file of data.files) {
          const compressed = await compressImage(file);
          const url = await uploadToCloudinary(compressed);
          newUrls.push(url);
        }
        imageUrls = [...imageUrls, ...newUrls].slice(0, 5);
      }

      const { error } = await supabase
        .from('marketplace_items')
        .update({
          title: data.title,
          description: data.description,
          price: data.price,
          category: data.category,
          images: imageUrls
        })
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-items'] });
      queryClient.invalidateQueries({ queryKey: ['user-marketplace-items'] });
      showSuccess("Annuncio aggiornato!");
    },
    onError: (err: any) => showError(err.message)
  });

  const updateItemStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'active' | 'sold' }) => {
      const { error } = await supabase
        .from('marketplace_items')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-items'] });
      queryClient.invalidateQueries({ queryKey: ['user-marketplace-items'] });
      showSuccess("Stato annuncio aggiornato!");
    },
    onError: (err: any) => showError(err.message)
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('marketplace_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-items'] });
      queryClient.invalidateQueries({ queryKey: ['user-marketplace-items'] });
      showSuccess("Annuncio rimosso.");
    }
  });

  return { items, isLoading, createItem, updateItem, updateItemStatus, deleteItem, refetch };
};

export const useUserMarketplace = (userId?: string) => {
  return useQuery({
    queryKey: ['user-marketplace-items', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('marketplace_items')
        .select(`
          id, seller_id, title, description, price, category, images, status, created_at,
          profiles:seller_id (username, avatar_url)
        `)
        .eq('seller_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        ...item,
        profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
      })) as MarketplaceItem[];
    },
    enabled: !!userId
  });
};

export const useSellerReviews = (sellerId?: string) => {
  return useQuery({
    queryKey: ['seller-reviews', sellerId],
    queryFn: async () => {
      if (!sellerId) return [];
      const { data, error } = await supabase
        .from('seller_reviews')
        .select(`
          *,
          reviewer:reviewer_id (username, avatar_url)
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.message?.includes('AbortError')) return [];
        throw error;
      }

      return (data || []).map((review: any) => ({
        ...review,
        reviewer: Array.isArray(review.reviewer) ? review.reviewer[0] : review.reviewer
      })) as SellerReview[];
    },
    enabled: !!sellerId
  });
};

export const useReviewSeller = () => {
  const queryClient = useQueryClient();

  const submitReview = useMutation({
    mutationFn: async ({ sellerId, rating, comment }: { sellerId: string, rating: number, comment: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi accedere per recensire");

      const { error } = await supabase
        .from('seller_reviews')
        .upsert([{
          seller_id: sellerId,
          reviewer_id: user.id,
          rating,
          comment
        }], { onConflict: 'seller_id, reviewer_id' });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['seller-reviews', variables.sellerId] });
      showSuccess("Recensione salvata!");
    },
    onError: (err: any) => showError(err.message)
  });

  const deleteReview = useMutation({
    mutationFn: async ({ reviewId, sellerId }: { reviewId: string, sellerId: string }) => {
      const { error } = await supabase
        .from('seller_reviews')
        .delete()
        .eq('id', reviewId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['seller-reviews', variables.sellerId] });
      showSuccess("Recensione eliminata.");
    },
    onError: (err: any) => showError(err.message)
  });

  return { submitReview, deleteReview };
};