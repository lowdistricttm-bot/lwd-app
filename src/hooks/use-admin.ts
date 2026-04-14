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

  const { data: allApplications, isLoading: loadingApps, error: loadError } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: async () => {
      // Recuperiamo le candidature
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

      // Recuperiamo i voti con i nomi (richiede i Foreign Keys impostati via SQL)
      const { data: votes, error: votesError } = await supabase
        .from('application_votes')
        .select(`
          *,
          profiles:user_id (username)
        `);

      if (votesError) {
        console.error("[Admin] Errore recupero voti:", votesError);
        // Fallback: restituiamo le app senza voti se la query fallisce ancora
        return apps.map(app => ({ ...app, application_votes: [] }));
      }

      return apps.map(app => ({
        ...app,
        application_votes: votes.filter(v => v.application_id === app.id) || []
      }));
    },
    enabled: canVote,
    refetchOnWindowFocus: true
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
      return { applicationId, vote, userId: user.id };
    },
    onMutate: async ({ applicationId, vote }) => {
      await queryClient.cancelQueries({ queryKey: ['admin-applications'] });
      const previousApps = queryClient.getQueryData(['admin-applications']);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return { previousApps };

      const { data: myProfile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
      const myUsername = myProfile?.username || 'Tu';

      queryClient.setQueryData(['admin-applications'], (old: any) => {
        if (!old) return old;
        return old.map((app: any) => {
          if (app.id !== applicationId) return app;
          const existingVotes = app.application_votes || [];
          const otherVotes = existingVotes.filter((v: any) => v.user_id !== user.id);
          return {
            ...app,
            application_votes: [...otherVotes, {
              application_id: applicationId,
              user_id: user.id,
              vote: vote,
              profiles: { username: myUsername }
            }]
          };
        });
      });

      return { previousApps };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousApps) {
        queryClient.setQueryData(['admin-applications'], context.previousApps);
      }
      showError("Errore durante la votazione");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
    }
  });

  return { 
    role, isAdmin, isStaff, isSupport, canManage, canVote, 
    checkingAdmin: checkingRole, 
    allApplications, loadingApps, loadError,
    updateStatus, castVote
  };
};