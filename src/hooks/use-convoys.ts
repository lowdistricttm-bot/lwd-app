"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';

export interface ConvoyStop {
  id: string;
  location: string;
  arrival_time: string;
  order_index: number;
}

export interface Convoy {
  id: string;
  event_id: string;
  creator_id: string;
  title: string;
  start_location: string;
  start_time: string;
  route_description: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
  convoy_stops?: ConvoyStop[];
  convoy_participants?: {
    user_id: string;
    profiles: {
      username: string;
      avatar_url: string;
    };
    vehicles: {
      brand: string;
      model: string;
    };
  }[];
  is_joined?: boolean;
}

export const useConvoys = (eventId?: string) => {
  const queryClient = useQueryClient();

  const { data: convoys, isLoading } = useQuery({
    queryKey: ['convoys', eventId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('convoys')
        .select(`
          *,
          profiles:creator_id (username, avatar_url),
          convoy_stops (*),
          convoy_participants (
            user_id,
            profiles:user_id (username, avatar_url),
            vehicles:vehicle_id (brand, model)
          )
        `)
        .order('start_time', { ascending: true });

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((c: any) => ({
        ...c,
        profiles: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles,
        convoy_stops: (c.convoy_stops || []).sort((a: any, b: any) => a.order_index - b.order_index),
        is_joined: user ? c.convoy_participants?.some((p: any) => p.user_id === user.id) : false
      })) as Convoy[];
    },
    enabled: true
  });

  const createConvoy = useMutation({
    mutationFn: async (data: { 
      eventId: string, 
      title: string, 
      startLocation: string, 
      startTime: string, 
      routeDescription: string,
      stops: { location: string, arrivalTime: string }[]
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per creare un convoglio");

      const { data: convoy, error: cError } = await supabase
        .from('convoys')
        .insert([{
          event_id: data.eventId,
          creator_id: user.id,
          title: data.title,
          start_location: data.startLocation,
          start_time: data.startTime,
          route_description: data.routeDescription
        }])
        .select()
        .single();

      if (cError) throw cError;

      if (data.stops.length > 0) {
        const stops = data.stops.map((s, i) => ({
          convoy_id: convoy.id,
          location: s.location,
          arrival_time: s.arrivalTime,
          order_index: i
        }));
        const { error: sError } = await supabase.from('convoy_stops').insert(stops);
        if (sError) throw sError;
      }

      // Auto-join creator
      const { data: mainVehicle } = await supabase
        .from('vehicles')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_main', true)
        .maybeSingle();

      await supabase.from('convoy_participants').insert([{
        convoy_id: convoy.id,
        user_id: user.id,
        vehicle_id: mainVehicle?.id
      }]);

      return convoy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convoys'] });
      showSuccess("Convoglio creato! Run to the show!");
    },
    onError: (err: any) => showError(err.message)
  });

  const toggleJoin = useMutation({
    mutationFn: async ({ convoyId, vehicleId }: { convoyId: string, vehicleId?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per unirti");

      const { data: existing } = await supabase
        .from('convoy_participants')
        .select('id')
        .eq('convoy_id', convoyId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        await supabase.from('convoy_participants').delete().eq('id', existing.id);
        return 'left';
      } else {
        await supabase.from('convoy_participants').insert([{
          convoy_id: convoyId,
          user_id: user.id,
          vehicle_id: vehicleId
        }]);
        return 'joined';
      }
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['convoys'] });
      showSuccess(res === 'joined' ? "Ti sei unito al convoglio!" : "Hai lasciato il convoglio.");
    },
    onError: (err: any) => showError(err.message)
  });

  const deleteConvoy = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('convoys').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convoys'] });
      showSuccess("Convoglio eliminato.");
    }
  });

  return { convoys, isLoading, createConvoy, toggleJoin, deleteConvoy };
};