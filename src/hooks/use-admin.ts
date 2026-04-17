"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';

export type UserRole = 'admin' | 'staff' | 'support' | 'member' | 'subscriber';

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

  const { data: allApplications, isLoading: loadingApps, error: loadError } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: async () => {
      const { data: apps, error: appsError } = await supabase
        .from('applications')
        .select(`
          *,
          profiles:user_id (first_name, last_name, avatar_url, username, role),
          vehicles:vehicle_id (*),
          events:event_id (title, location, date)
        `)
        .order('applied_at', { ascending: false });

      if (appsError) throw appsError;
      if (!apps) return [];

      const { data: votes } = await supabase.from('application_votes').select('*, profiles:user_id (username)');
      return apps.map(app => ({
        ...app,
        application_votes: votes?.filter(v => v.application_id === app.id) || []
      }));
    },
    enabled: canVote
  });

  const { data: allUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('username', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'approved' | 'rejected' }) => {
      if (!canManage) throw new Error("Permessi insufficienti");
      
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;

      const { data: { session } } = await supabase.auth.getSession();
      try {
        await fetch('https://cxjqbxhhslxqpkfcwqhr.supabase.co/functions/v1/send-application-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({ applicationId: id, status })
        });
      } catch (emailErr) {
        console.error("[Admin] Errore invio email:", emailErr);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      showSuccess("Stato aggiornato!");
    },
    onError: (error: any) => showError(error.message)
  });

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string, newRole: UserRole }) => {
      if (!isAdmin) throw new Error("Solo gli amministratori possono cambiare i ruoli");
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          is_admin: newRole === 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });
      queryClient.invalidateQueries({ queryKey: ['user-role'] });
      showSuccess("Ruolo utente aggiornato!");
    },
    onError: (error: any) => {
      console.error("[Admin] Errore update ruolo:", error);
      showError("Errore durante il salvataggio del ruolo.");
    }
  });

  const castVote = useMutation({
    mutationFn: async ({ applicationId, vote }: { applicationId: string, vote: 'approve' | 'reject' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per votare");
      const { error } = await supabase.from('application_votes').upsert({ application_id: applicationId, user_id: user.id, vote }, { onConflict: 'application_id, user_id' });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-applications'] })
  });

  const deleteApplication = useMutation({
    mutationFn: async (id: string) => {
      if (!canManage) throw new Error("Permessi insufficienti");
      const { error: votesError } = await supabase.from('application_votes').delete().eq('application_id', id);
      if (votesError) throw votesError;
      await supabase.from('notifications').delete().eq('application_id', id);
      const { error: appError } = await supabase.from('applications').delete().eq('id', id);
      if (appError) throw appError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      queryClient.invalidateQueries({ queryKey: ['user-applications'] });
      showSuccess("Candidatura eliminata definitivamente");
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
    checkingAdmin: checkingRole, 
    allApplications, 
    loadingApps, 
    loadError, 
    updateStatus, 
    castVote, 
    deleteApplication,
    allUsers,
    loadingUsers,
    updateUserRole
  };
};