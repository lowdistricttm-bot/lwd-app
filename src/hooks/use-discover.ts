"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Vehicle } from './use-garage';

export const useDiscover = (searchQuery: string = "") => {
  // Query per i veicoli (con filtro se presente)
  const { data: vehicles, isLoading: loadingVehicles } = useQuery({
    queryKey: ['discover-vehicles', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('vehicles')
        .select(`
          *,
          profiles:user_id (username, avatar_url, role, is_admin)
        `)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        // Ricerca per marca o modello
        query = query.or(`brand.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%`);
      } else {
        query = query.limit(40);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(v => ({
        ...v,
        images: Array.isArray(v.images) ? v.images : (v.image_url ? [v.image_url] : [])
      })) as (Vehicle & { profiles: { username: string, avatar_url: string, role: string, is_admin: boolean } })[];
    }
  });

  // Query per gli utenti (solo se c'è una ricerca)
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['discover-users', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: searchQuery.length > 0
  });

  // Suggerimenti: Nuovi membri (mostrati quando non si cerca)
  const { data: newMembers } = useQuery({
    queryKey: ['discover-new-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(8);
      
      if (error) return [];
      return data;
    },
    enabled: !searchQuery
  });

  return { 
    vehicles, 
    users, 
    newMembers,
    isLoading: loadingVehicles || loadingUsers 
  };
};