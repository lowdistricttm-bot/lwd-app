"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';

export interface VehicleTrophy {
  id: string;
  vehicle_id: string;
  trophy_type: string;
  event_name: string;
  created_at: string;
}

export const useTrophies = (vehicleId?: string) => {
  const queryClient = useQueryClient();

  const { data: trophies, isLoading } = useQuery({
    queryKey: ['vehicle-trophies', vehicleId],
    queryFn: async () => {
      if (!vehicleId) return [];
      const { data, error } = await supabase
        .from('vehicle_trophies')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as VehicleTrophy[];
    },
    enabled: !!vehicleId
  });

  const awardTrophy = useMutation({
    mutationFn: async (data: { vehicleId: string, type: string, eventName: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('vehicle_trophies')
        .insert([{
          vehicle_id: data.vehicleId,
          trophy_type: data.type,
          event_name: data.eventName,
          awarded_by: user?.id
        }]);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-trophies', variables.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['garage-vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['discover-vehicles'] });
      showSuccess("Trofeo assegnato con successo!");
    },
    onError: (err: any) => showError(err.message)
  });

  const removeTrophy = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vehicle_trophies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-trophies'] });
      queryClient.invalidateQueries({ queryKey: ['garage-vehicles'] });
      showSuccess("Trofeo rimosso.");
    }
  });

  return { trophies, isLoading, awardTrophy, removeTrophy };
};