"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Vehicle } from './use-garage';

export const useLeaderboards = () => {
  // 1. Classifica per Low Score (AI)
  const { data: topScored, isLoading: loadingScores } = useQuery({
    queryKey: ['leaderboard-scores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          profiles:user_id (username, avatar_url, role, is_admin),
          vehicle_likes (user_id),
          user_trophies (id, trophies (*))
        `)
        .not('stance_score', 'is', null)
        .order('stance_score', { ascending: false })
        .limit(10);

      if (error) throw error;
      return (data || []).map((v: any) => ({
        ...v,
        likes_count: v.vehicle_likes?.length || 0
      })) as (Vehicle & { likes_count: number })[];
    }
  });

  // 2. Classifica per Like della Community
  const { data: mostLiked, isLoading: loadingLikes } = useQuery({
    queryKey: ['leaderboard-likes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          profiles:user_id (username, avatar_url, role, is_admin),
          vehicle_likes (user_id),
          user_trophies (id, trophies (*))
        `)
        .limit(100);

      if (error) throw error;

      return (data || [])
        .map((v: any) => ({
          ...v,
          likes_count: v.vehicle_likes?.length || 0
        }))
        .sort((a, b) => b.likes_count - a.likes_count)
        .slice(0, 10) as (Vehicle & { likes_count: number })[];
    }
  });

  // 3. Classifica per Reputazione (Recupera i veicoli degli utenti con più REP)
  const { data: topReputation, isLoading: loadingRep } = useQuery({
    queryKey: ['leaderboard-reputation-vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          profiles!inner (
            id,
            username,
            avatar_url,
            role,
            is_admin,
            reputation
          ),
          vehicle_likes (user_id),
          user_trophies (id, trophies (*))
        `)
        .order('profiles(reputation)', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      return (data || []).map((v: any) => ({
        ...v,
        likes_count: v.vehicle_likes?.length || 0
      })) as (Vehicle & { likes_count: number })[];
    }
  });

  return { 
    topScored, 
    mostLiked, 
    topReputation,
    isLoading: loadingScores || loadingLikes || loadingRep 
  };
};