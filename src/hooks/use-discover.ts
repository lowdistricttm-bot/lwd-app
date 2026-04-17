"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Vehicle } from './use-garage';

// Lista dei ruoli autorizzati a comparire nella sezione Esplora
const AUTHORIZED_ROLES = ['admin', 'staff', 'support', 'member'];

export const useDiscover = (searchQuery: string = "") => {
  // Query per i veicoli (filtrata per ruolo del proprietario)
  const { data: vehicles, isLoading: loadingVehicles } = useQuery({
    queryKey: ['discover-vehicles', searchQuery],
    queryFn: async () => {
      // Usiamo profiles:user_id!inner per specificare la chiave esterna e forzare l'inner join
      let query = supabase
        .from('vehicles')
        .select(`
          *,
          profiles:user_id!inner (
            username, 
            avatar_url, 
            role, 
            is_admin
          )
        `)
        .in('profiles.role', AUTHORIZED_ROLES)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        // Ricerca per marca o modello (il case-insensitive è gestito da ilike)
        query = query.or(`brand.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%`);
      } else {
        query = query.limit(40);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("[Discover] Errore query veicoli:", error);
        return [];
      }

      return data.map(v => ({
        ...v,
        images: Array.isArray(v.images) ? v.images : (v.image_url ? [v.image_url] : [])
      })) as (Vehicle & { profiles: { username: string, avatar_url: string, role: string, is_admin: boolean } })[];
    }
  });

  // Query per gli utenti (filtrata per ruolo)
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['discover-users', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', AUTHORIZED_ROLES)
        .ilike('username', `%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: searchQuery.length > 0
  });

  // Suggerimenti: Nuovi membri verificati (mostrati quando non si cerca)
  const { data: newMembers } = useQuery({
    queryKey: ['discover-new-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', AUTHORIZED_ROLES)
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