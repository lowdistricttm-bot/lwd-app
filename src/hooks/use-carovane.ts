"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';

export interface CarovanaTappa {
  id: string;
  location: string;
  arrival_time: string;
  order_index: number;
}

export interface Carovana {
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
  carovane_tappe?: CarovanaTappa[];
  carovane_partecipanti?: {
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

export const useCarovane = (eventId?: string) => {
  const queryClient = useQueryClient();

  const { data: carovane, isLoading, refetch } = useQuery({
    queryKey: ['carovane', eventId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('carovane')
        .select(`
          *,
          profiles:creator_id (username, avatar_url),
          carovane_tappe (*),
          carovane_partecipanti (
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
      if (error) {
        console.error("[Carovane] Error fetching:", error);
        return [];
      }

      return (data || []).map((c: any) => ({
        ...c,
        profiles: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles,
        carovane_tappe: (c.carovane_tappe || []).sort((a: any, b: any) => a.order_index - b.order_index),
        is_joined: user ? c.carovane_partecipanti?.some((p: any) => p.user_id === user.id) : false
      })) as Carovana[];
    },
    staleTime: 0 // Assicura che i dati siano sempre considerati freschi per il refetch
  });

  const createCarovana = useMutation({
    mutationFn: async (data: { 
      eventId: string, 
      title: string, 
      startLocation: string, 
      startTime: string, 
      routeDescription: string,
      stops: { location: string, arrivalTime: string }[]
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per creare una carovana");

      const { data: carovana, error: cError } = await supabase
        .from('carovane')
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
          carovana_id: carovana.id,
          location: s.location,
          arrival_time: s.arrivalTime || null,
          order_index: i
        }));
        const { error: sError } = await supabase.from('carovane_tappe').insert(stops);
        if (sError) throw sError;
      }

      const { data: mainVehicle } = await supabase
        .from('vehicles')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_main', true)
        .maybeSingle();

      await supabase.from('carovane_partecipanti').insert([{
        carovana_id: carovana.id,
        user_id: user.id,
        vehicle_id: mainVehicle?.id || null
      }]);

      return carovana;
    },
    onSuccess: (_, variables) => {
      // Invalida sia la lista generale che quella specifica dell'evento per aggiornamento immediato
      queryClient.invalidateQueries({ queryKey: ['carovane'] });
      queryClient.invalidateQueries({ queryKey: ['carovane', variables.eventId] });
      showSuccess("Carovana creata! Run to the show!");
    },
    onError: (err: any) => showError(err.message)
  });

  const toggleJoin = useMutation({
    mutationFn: async ({ carovanaId, vehicleId }: { carovanaId: string, vehicleId?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per unirti");

      const { data: existing } = await supabase
        .from('carovane_partecipanti')
        .select('id')
        .eq('carovana_id', carovanaId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        await supabase.from('carovane_partecipanti').delete().eq('id', existing.id);
        return 'left';
      } else {
        await supabase.from('carovane_partecipanti').insert([{
          carovana_id: carovanaId,
          user_id: user.id,
          vehicle_id: vehicleId || null
        }]);
        return 'joined';
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carovane'] });
      showSuccess("Stato partecipazione aggiornato!");
    },
    onError: (err: any) => showError(err.message)
  });

  const deleteCarovana = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('carovane').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carovane'] });
      showSuccess("Carovana eliminata.");
    }
  });

  return { carovane, isLoading, createCarovana, toggleJoin, deleteCarovana, refetch };
};