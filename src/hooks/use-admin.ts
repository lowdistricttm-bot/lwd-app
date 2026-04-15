"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';

export const useAdmin = () => {
  const queryClient = useQueryClient();

  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ['is-admin'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error("[Admin] Errore verifica permessi:", error);
        return false;
      }
      return data?.is_admin || false;
    },
    retry: 1
  });

  const { data: allApplications, isLoading: loadingApps, error: loadError } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: async () => {
      console.log("[Admin] Caricamento candidature in corso...");
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          profiles:user_id (first_name, last_name, avatar_url, username),
          vehicles:vehicle_id (*),
          events:event_id (title, location, date)
        `)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error("[Admin] Errore query candidature:", error);
        throw error;
      }
      
      console.log("[Admin] Candidature caricate:", data?.length);
      return data || [];
    },
    enabled: !!isAdmin,
    refetchOnWindowFocus: true
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      queryClient.invalidateQueries({ queryKey: ['user-applications'] });
      showSuccess("Stato aggiornato con successo");
    },
    onError: (error: any) => {
      console.error("[Admin] Errore aggiornamento stato:", error);
      showError("Impossibile aggiornare lo stato: " + error.message);
    }
  });

  return { isAdmin, checkingAdmin, allApplications, loadingApps, loadError, updateStatus };
};