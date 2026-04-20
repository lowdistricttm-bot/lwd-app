"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from 'react';
import { showError, showSuccess } from '@/utils/toast';
import { uploadToCloudinary } from '@/utils/cloudinary';

export interface Meet {
  id: string;
  user_id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url?: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
}

export const useMeets = () => {
  const queryClient = useQueryClient();

  const { data: meets = [], isLoading, refetch } = useQuery({
    queryKey: ['district-meets'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('meets')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .gte('date', today.toISOString())
        .order('date', { ascending: true });

      if (error) {
        console.error("[Meets] Errore:", error);
        return [];
      }
      return (data || []) as Meet[];
    },
    staleTime: 0
  });

  useEffect(() => {
    // Generiamo un ID univoco per il canale per evitare conflitti di sottoscrizione
    const channelId = `meets-${Math.random().toString(36).substring(2, 9)}`;

    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'meets' }, 
        () => {
          queryClient.invalidateQueries({ queryKey: ['district-meets'] });
        }
      )
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [queryClient]);

  const createMeet = useMutation({
    mutationFn: async (newMeet: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per creare un meet");

      let image_url = null;
      if (newMeet.file) {
        image_url = await uploadToCloudinary(newMeet.file);
      }

      const { error } = await supabase
        .from('meets')
        .insert([{
          user_id: user.id,
          title: newMeet.title,
          description: newMeet.description,
          date: newMeet.date,
          location: newMeet.location,
          image_url
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['district-meets'] });
      showSuccess("Meet pubblicato!");
    },
    onError: (err: any) => showError(err.message)
  });

  const deleteMeet = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('meets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['district-meets'] });
      showSuccess("Meet rimosso.");
    }
  });

  return { meets, isLoading, createMeet, deleteMeet, refetch };
};