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

  const awardTrophy = useMutation({
    mutationFn: async (data: { userId: string, trophyId: string, vehicleId?: string }) => {
      const { error } = await supabase
        .from('user_trophies')
        .insert([{
          user_id: data.userId,
          trophy_id: data.trophyId,
          vehicle_id: data.vehicleId || null
        }]);

      if (error) {
        if (error.code === '23505') throw new Error("Questo utente ha già ricevuto questo trofeo per questo veicolo.");
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-trophies', variables.userId] });
      showSuccess("Trofeo assegnato con successo!");
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
    awardTrophy,
    revokeTrophy
  };
};