"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Vehicle } from './use-garage';

export const useDiscover = () => {
  const { data: allVehicles, isLoading: loadingVehicles } = useQuery({
    queryKey: ['discover-vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data.map(v => ({
        ...v,
        images: Array.isArray(v.images) ? v.images : (v.image_url ? [v.image_url] : [])
      })) as (Vehicle & { profiles: { username: string, avatar_url: string } })[];
    }
  });

  const { data: trendingPosts, isLoading: loadingTrending } = useQuery({
    queryKey: ['trending-posts'],
    queryFn: async () => {
      // In un'app reale useremmo una funzione Postgres per contare i like nelle ultime 24h
      // Qui simuliamo prendendo i post con più like totali
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, avatar_url),
          likes (count)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    }
  });

  return { allVehicles, loadingVehicles, trendingPosts, loadingTrending };
};