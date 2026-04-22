"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';

export interface Trophy {
  id: string;
  title: string;
  description: string;
  event_name: string;
  category: string;
  image_url?: string;
}

export interface UserTrophy {
  id: string;
  user_id: string;
  vehicle_id?: string;
  trophy_id: string;
  awarded_at: string;
  trophies?: Trophy;
  vehicles?: {
    brand: string;
    model: string;
  };
}

export const useTrophies = (userId?: string) => {
  const queryClient = useQueryClient();

  const { data: availableTrophies, isLoading: loadingAvailable } = useQuery({
    queryKey: ['available-trophies'],
    queryFn: async () => {
      const { data, error } = await supabase.from('trophies').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Trophy[];
    }
  });

  const { data: userTrophies, isLoading: loadingUserTrophies } = useQuery({
    queryKey: ['user-trophies', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('user_trophies')
        .select(`
          *,
          trophies (*),
          vehicles (brand, model)
        `)
        .eq('user_id', userId)
        .order('awarded_at', { ascending: false });

      if (error) throw error;
      return data as UserTrophy[];
    },
    enabled: !!userId
  });

  const createAndAwardTrophy = useMutation({
    mutationFn: async (data: { 
      userId: string, 
      vehicleId?: string,
      title: string,
      eventName: string,
      category: string 
    }) => {
      // 1. Crea il trofeo nel catalogo
      const { data: newTrophy, error: tError } = await supabase
        .from('trophies')
        .insert([{
          title: data.title.toUpperCase(),
          event_name: data.eventName.toUpperCase(),
          category: data.category,
          description: `Premio assegnato durante ${data.eventName}`
        }])
        .select()
        .single();

      if (tError) throw tError;

      // 2. Assegnalo all'utente
      const { error: aError } = await supabase
        .from('user_trophies')
        .insert([{
          user_id: data.userId,
          trophy_id: newTrophy.id,
          vehicle_id: data.vehicleId || null
        }]);

      if (aError) throw aError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-trophies', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['available-trophies'] });
      showSuccess("Premio creato e assegnato!");
    },
    onError: (err: any) => showError(err.message)
  });

  const revokeTrophy = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('user_trophies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-trophies'] });
      showSuccess("Trofeo revocato correttamente.");
    },
    onError: (err: any) => showError("Errore durante la revoca.")
  });

  return { 
    availableTrophies, 
    userTrophies, 
    isLoading: loadingAvailable || loadingUserTrophies,
    createAndAwardTrophy,
    revokeTrophy
  };
};