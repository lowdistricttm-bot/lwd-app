"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';

export interface RoleRequest {
  id: string;
  user_id: string;
  requested_role: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
}

export const useRoleRequests = () => {
  const queryClient = useQueryClient();

  const { data: myRequest, isLoading: loadingMyRequest } = useQuery({
    queryKey: ['my-role-request'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('role_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) return null;
      return data as RoleRequest;
    }
  });

  const { data: allRequests, isLoading: loadingAll } = useQuery({
    queryKey: ['admin-role-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_requests')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as RoleRequest[];
    }
  });

  const sendRequest = useMutation({
    mutationFn: async (role: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non autenticato");

      const { error } = await supabase
        .from('role_requests')
        .insert([{ user_id: user.id, requested_role: role }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-role-request'] });
      showSuccess("Richiesta inviata allo staff!");
    },
    onError: (err: any) => showError(err.message)
  });

  const handleRequest = useMutation({
    mutationFn: async ({ requestId, userId, status, role }: { requestId: string, userId: string, status: 'approved' | 'rejected', role: string }) => {
      // 1. Aggiorna lo stato della richiesta
      const { error: requestError } = await supabase
        .from('role_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // 2. Se approvato, aggiorna il ruolo nel profilo
      if (status === 'approved') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role, updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (profileError) throw profileError;
      }

      // 3. Invia notifica all'utente
      await supabase.from('notifications').insert([{
        user_id: userId,
        actor_id: (await supabase.auth.getUser()).data.user?.id,
        type: 'admin_info',
        content: status === 'approved' 
          ? `Complimenti! La tua richiesta per diventare ${role.toUpperCase()} è stata approvata.` 
          : `La tua richiesta per il ruolo ${role.toUpperCase()} non è stata accettata al momento.`
      }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-role-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });
      showSuccess("Richiesta gestita correttamente");
    },
    onError: (err: any) => showError(err.message)
  });

  return { myRequest, loadingMyRequest, allRequests, loadingAll, sendRequest, handleRequest };
};