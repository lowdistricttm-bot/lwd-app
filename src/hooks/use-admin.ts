"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';

export type UserRole = 'admin' | 'staff' | 'support' | 'member';

export const useAdmin = () => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading: checkingRole } = useQuery({
    queryKey: ['user-role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_admin')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) return null;
      return data;
    }
  });

  const role = profile?.role || (profile?.is_admin ? 'admin' : 'member');
  const isAdmin = role === 'admin';
  const isStaff = role === 'staff';
  const isSupport = role === 'support';
  const canManage = isAdmin || isStaff;
  const canVote = isAdmin || isStaff || isSupport;

  const { data: allApplications, isLoading: loadingApps } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          profiles:user_id (first_name, last_name, avatar_url, username, role),
          vehicles:vehicle_id (*),
          events:event_id (title, location, date),
          application_votes (*)
        `)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: canVote
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'approved' | 'rejected' }) => {
      if (!canManage) throw new Error("Non hai i permessi per approvare o rifiutare.");
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      showSuccess("Stato aggiornato con successo");
    },
    onError: (error: any) => showError(error.message)
  });

  const castVote = useMutation({
    mutationFn: async ({ applicationId, vote }: { applicationId: string, vote: 'approve' | 'reject' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi accedere per votare.");

      const { error } = await supabase
        .from('application_votes')
        .upsert({ 
          application_id: applicationId, 
          user_id: user.id, 
          vote 
        }, { onConflict: 'application_id, user_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      showSuccess("Voto registrato");
    },
    onError: (error: any) => showError(error.message)
  });

  return { 
    role, 
    isAdmin, 
    isStaff, 
    isSupport, 
    canManage, 
    canVote, 
    checkingRole, 
    allApplications, 
    loadingApps, 
    updateStatus,
    castVote
  };
};