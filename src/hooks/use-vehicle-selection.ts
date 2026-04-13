"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

export const useVehicleSelection = (userId: string) => {
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data as any[];
    }
  });

  return { vehicles, isLoading };
};