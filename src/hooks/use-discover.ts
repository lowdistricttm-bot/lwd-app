"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Vehicle } from './use-garage';

const AUTHORIZED_ROLES = ['admin', 'staff', 'support', 'member'];

export const useDiscover = (searchQuery: string = "") => {
  const { data: vehicles, isLoading: loadingVehicles } = useQuery({
    queryKey: ['discover-vehicles', searchQuery],
    queryFn: async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      let query = supabase
        .from('vehicles')
        .select(`
          *,
          profiles:user_id (
            username, 
            avatar_url, 
            role, 
            is_admin
          ),
          vehicle_likes (user_id)
        `)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`brand.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%`);
      } else {
        query = query.limit(40);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("[Discover] Errore query veicoli:", error);
        return [];
      }

      const filteredData = (data || [])
        .filter((v: any) => v.profiles && AUTHORIZED_ROLES.includes(v.profiles.role))
        .map((v: any) => ({
          ...v,
          images: Array.isArray(v.images) ? v.images : (v.image_url ? [v.image_url] : []),
          likes_count: v.vehicle_likes?.length || 0,
          is_liked: currentUser ? v.vehicle_likes?.some((l: any) => l.user_id === currentUser.id) : false
        }));

      return filteredData;
    }
  });

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