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
  latitude?: number;
  longitude?: number;
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
      // Calcoliamo l'inizio di oggi (mezzanotte locale) per mostrare tutti i meet odierni
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      const { data, error } = await supabase
        .from('meets')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .gte('date', startOfToday)
        .order('date', { ascending: true });

      if (error) {
        console.error("[Meets] Errore caricamento:", error);
        return [];
      }
      
      // Gestione join Supabase (potrebbe restituire un array o un oggetto)
      return (data || []).map((m: any) => ({
        ...m,
        profiles: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
      })) as Meet[];
    },
    staleTime: 0
  });

  useEffect(() => {
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
          date: newMeet.date, // Già convertito in ISO dal componente
          location: newMeet.location,
          latitude: newMeet.latitude,
          longitude: newMeet.longitude,
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