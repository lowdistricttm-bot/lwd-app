"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';

export interface Highlight {
  id: string;
  user_id: string;
  title: string;
  cover_url: string;
  created_at: string;
  highlight_items?: any[];
}

export const useHighlights = (userId?: string) => {
  const queryClient = useQueryClient();

  const { data: highlights, isLoading } = useQuery({
    queryKey: ['user-highlights', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('highlights')
        .select(`
          *,
          highlight_items (
            id,
            story_id,
            stories (*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Highlight[];
    },
    enabled: !!userId
  });

  const createHighlight = useMutation({
    mutationFn: async ({ title, storyId, coverUrl }: { title: string, storyId: string, coverUrl: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per creare evidenze");

      // 1. Crea la raccolta
      const { data: highlight, error: hError } = await supabase
        .from('highlights')
        .insert([{ user_id: user.id, title, cover_url: coverUrl }])
        .select()
        .single();

      if (hError) throw hError;

      // 2. Aggiungi la prima storia
      const { error: iError } = await supabase
        .from('highlight_items')
        .insert([{ highlight_id: highlight.id, story_id: storyId }]);

      if (iError) throw iError;
      return highlight;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-highlights'] });
      showSuccess("Aggiunto ai contenuti in evidenza!");
    },
    onError: (err: any) => showError(err.message)
  });

  const addToHighlight = useMutation({
    mutationFn: async ({ highlightId, storyId }: { highlightId: string, storyId: string }) => {
      const { error } = await supabase
        .from('highlight_items')
        .insert([{ highlight_id: highlightId, story_id: storyId }]);

      if (error) {
        if (error.code === '23505') throw new Error("Questa storia è già presente in questa raccolta");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-highlights'] });
      showSuccess("Storia aggiunta alla raccolta!");
    },
    onError: (err: any) => showError(err.message)
  });

  const deleteHighlight = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('highlights').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-highlights'] });
      showSuccess("Raccolta eliminata");
    }
  });

  return { highlights, isLoading, createHighlight, addToHighlight, deleteHighlight };
};