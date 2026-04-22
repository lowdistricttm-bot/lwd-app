"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Vehicle } from './use-garage';

export const useLeaderboards = () => {
  const { data: topScored, isLoading: loadingScores } = useQuery({
    queryKey: ['leaderboard-scores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          profiles:user_id (username, avatar_url, role),
          vehicle_likes (user_id)
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

  const { data: mostLiked, isLoading: loadingLikes } = useQuery({
    queryKey: ['leaderboard-likes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          profiles:user_id (username, avatar_url, role),
          vehicle_likes (user_id)
        `)
        .limit(100);

      if (error) throw error;

      const sorted = (data || [])
        .map((v: any) => ({
          ...v,
          likes_count: v.vehicle_likes?.length || 0
        }))
        .sort((a, b) => b.likes_count - a.likes_count)
        .slice(0, 10);

      return sorted as (Vehicle & { likes_count: number })[];
    }
  });

  return { 
    topScored, 
    mostLiked, 
    isLoading: loadingScores || loadingLikes 
  };
};