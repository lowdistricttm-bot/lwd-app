"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from 'react';
import { showError, showSuccess } from '@/utils/toast';
import { uploadToCloudinary } from '@/utils/cloudinary';

export interface Meet {
  id: string;
  user_id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  created_at: string;
  privacy?: 'public' | 'private';
  invite_code?: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
  participants?: {
    user_id: string;
    profiles: {
      username: string;
      avatar_url: string;
    };
  }[];
  is_participating?: boolean;
}

export const useMeets = () => {
  const queryClient = useQueryClient();

  const { data: meets = [], isLoading, refetch } = useQuery({
    queryKey: ['district-meets'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      const { data, error } = await supabase
        .from('meets')
        .select(`
          *,
          profiles:user_id (username, avatar_url),
          meet_participants (
            user_id,
            profiles:user_id (username, avatar_url)
          )
        `)
        .gte('date', startOfToday)
        .order('date', { ascending: true });

      if (error) {
        console.error("[Meets] Errore caricamento:", error);
        return [];
      }
      
      return (data || []).map((m: any) => ({
        ...m,
        profiles: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles,
        participants: m.meet_participants || [],
        is_participating: user ? m.meet_participants?.some((p: any) => p.user_id === user.id) : false
      })) as Meet[];
    },
    staleTime: 0
  });

  useEffect(() => {
    const channelId = `meets-global-${Math.random().toString(36).substring(2, 9)}`;

    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'meets' }, 
        () => queryClient.invalidateQueries({ queryKey: ['district-meets'] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'meet_participants' },
        () => queryClient.invalidateQueries({ queryKey: ['district-meets'] })
      )
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [queryClient]);

  const createMeet = useMutation({
    mutationFn: async (newMeet: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per creare un meet");

      let image_url = null;
      if (newMeet.file) {
        image_url = await uploadToCloudinary(newMeet.file);
      }

      const invite_code = newMeet.privacy === 'private' 
        ? 'DISTRICT-' + Math.random().toString(36).substring(2, 10).toUpperCase() 
        : null;

      const { data: meet, error } = await supabase
        .from('meets')
        .insert([{
          user_id: user.id,
          title: newMeet.title,
          description: newMeet.description,
          date: newMeet.date,
          location: newMeet.location,
          latitude: newMeet.latitude,
          longitude: newMeet.longitude,
          image_url,
          privacy: newMeet.privacy,
          invite_code
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Auto-partecipazione
      await supabase.from('meet_participants').insert([{ meet_id: meet.id, user_id: user.id }]);
      
      return meet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['district-meets'] });
      showSuccess("Meet pubblicato!");
    },
    onError: (err: any) => showError(err.message)
  });

  const toggleParticipation = useMutation({
    mutationFn: async (meetId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per partecipare");

      const { data: existing } = await supabase
        .from('meet_participants')
        .select('id')
        .eq('meet_id', meetId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('meet_participants')
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
        return 'removed';
      } else {
        const { error } = await supabase
          .from('meet_participants')
          .insert([{ meet_id: meetId, user_id: user.id }]);
        if (error) throw error;
        return 'added';
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['district-meets'] });
      showSuccess(result === 'added' ? "Ti sei unito all'incontro!" : "Partecipazione annullata.");
    },
    onError: (err: any) => showError(err.message)
  });

  const deleteMeet = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('meets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['district-meets'] });
      showSuccess("Meet rimosso.");
    }
  });

  return { meets, isLoading, createMeet, deleteMeet, toggleParticipation, refetch };
};