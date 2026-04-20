"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';

export const useVehicleLogs = (vehicleId?: string) => {
  const queryClient = useQueryClient();

  const { data: logs, isLoading } = useQuery({
    queryKey: ['vehicle-logs', vehicleId],
    queryFn: async () => {
      if (!vehicleId) return [];
      const { data, error } = await supabase
        .from('vehicle_logs')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('event_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!vehicleId
  });

  const addLog = useMutation({
    mutationFn: async (newLog: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('vehicle_logs').insert([{ ...newLog, user_id: user?.id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-logs', vehicleId] });
      showSuccess("Evento registrato nel diario!");
    },
    onError: (err: any) => showError(err.message)
  });

  const deleteLog = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vehicle_logs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-logs', vehicleId] });
      showSuccess("Evento rimosso.");
    }
  });

  return { logs, isLoading, addLog, deleteLog };
};