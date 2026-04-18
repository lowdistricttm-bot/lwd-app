"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError } from '@/utils/toast';

export const useFollow = (targetUserId?: string) => {
  const queryClient = useQueryClient();

  // Verifica se l'utente corrente segue il target
  const { data: isFollowing, isLoading: checkingFollow } = useQuery({
    queryKey: ['is-following', targetUserId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !targetUserId || user.id === targetUserId) return false;

      const { data, error } = await supabase
        .from('followers')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle();

      if (error) return false;
      return !!data;
    },
    enabled: !!targetUserId
  });

  // Recupera i conteggi (Follower e Seguiti)
  const { data: counts, isLoading: loadingCounts } = useQuery({
    queryKey: ['follow-counts', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return { followers: 0, following: 0 };

      const [followersRes, followingRes] = await Promise.all([
        supabase.from('followers').select('*', { count: 'exact', head: true }).eq('following_id', targetUserId),
        supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', targetUserId)
      ]);

      return {
        followers: followersRes.count || 0,
        following: followingRes.count || 0
      };
    },
    enabled: !!targetUserId
  });

  const toggleFollow = useMutation({
    mutationFn: async () => {
      if (!targetUserId) return;

      const { data, error } = await supabase.rpc('toggle_follow', { 
        target_id: targetUserId 
      });

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Invalidiamo le query per il target (chi riceve il follow)
      queryClient.invalidateQueries({ queryKey: ['is-following', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['follow-counts', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['follow-list', targetUserId] });
      
      // Invalidiamo le query per l'utente corrente (chi mette il follow)
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['follow-counts', user.id] });
        queryClient.invalidateQueries({ queryKey: ['follow-list', user.id] });
      }

      // Aggiorniamo anche le liste globali
      queryClient.invalidateQueries({ queryKey: ['discover-new-members'] });
    },
    onError: (err: any) => showError(err.message)
  });

  return { isFollowing, checkingFollow, counts, loadingCounts, toggleFollow };
};

export const useFollowList = (userId: string, type: 'followers' | 'following') => {
  return useQuery({
    queryKey: ['follow-list', userId, type],
    queryFn: async () => {
      // Se cerchiamo i FOLLOWER di X, cerchiamo chi segue X (following_id = X)
      // Se cerchiamo i SEGUITI di X, cerchiamo chi X segue (follower_id = X)
      const isFollowers = type === 'followers';
      const filterColumn = isFollowers ? 'following_id' : 'follower_id';
      const joinColumn = isFollowers ? 'follower_id' : 'following_id';

      const { data, error } = await supabase
        .from('followers')
        .select(`
          profile:${joinColumn} (
            id,
            username,
            avatar_url,
            role
          )
        `)
        .eq(filterColumn, userId);

      if (error) {
        console.error("[FollowList] Errore:", error);
        throw error;
      }

      return (data || [])
        .map((item: any) => item.profile)
        .filter(Boolean);
    },
    enabled: !!userId,
    staleTime: 0 // Forza il ricaricamento quando il modal si apre
  });
};