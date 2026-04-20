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
  created_at: string;
  profiles?: {
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

  const { data: items, isLoading, refetch } = useQuery({
    queryKey: ['marketplace-items', categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from('marketplace_items')
        .select(`
          *,
          profiles:seller_id (username, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MarketplaceItem[];
    },
    staleTime: 0,
    refetchOnMount: true
  });

  // Realtime listener per aggiornamento immediato
  useEffect(() => {
    const channelId = `marketplace-${Math.random().toString(36).substring(2, 9)}`;
    
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'marketplace_items' },
        () => {
          console.log("[Marketplace] Cambio rilevato, rinfresco dati...");
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
      if (!user) throw new Error("Devi accedere per pubblicare un annuncio");

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
          images: imageUrls
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalida tutte le query del marketplace per forzare il refresh
      queryClient.invalidateQueries({ queryKey: ['marketplace-items'] });
      showSuccess("Annuncio pubblicato correttamente!");
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
      showSuccess("Annuncio rimosso.");
    }
  });

  return { items, isLoading, createItem, deleteItem, refetch };
};