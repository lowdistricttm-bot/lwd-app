"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';
import { useEffect } from 'react';

export interface Story {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  expires_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
    role?: string;
    is_admin?: boolean;
  };
}

export const useStories = () => {
  const queryClient = useQueryClient();

  const { data: stories, isLoading } = useQuery({
    queryKey: ['active-stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            role,
            is_admin
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error("[Stories] Errore caricamento:", error.message);
        return [];
      }

      return formatStories(data || []);
    }
  });

  const formatStories = (data: any[]) => {
    const grouped = data.reduce((acc: any, story: any) => {
      if (!acc[story.user_id]) {
        acc[story.user_id] = {
          user_id: story.user_id,
          username: story.profiles?.username || 'Utente',
          avatar_url: story.profiles?.avatar_url,
          role: story.profiles?.role || (story.profiles?.is_admin ? 'admin' : 'member'),
          items: []
        };
      }
      acc[story.user_id].items.push(story);
      return acc;
    }, {});

    return Object.values(grouped);
  };

  const recordView = useMutation({
    mutationFn: async (storyId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Usiamo upsert con nomi di colonna espliciti per matchare il vincolo UNIQUE
      const { error } = await supabase
        .from('story_views')
        .upsert(
          { 
            story_id: storyId, 
            user_id: user.id,
            viewed_at: new Date().toISOString() 
          }, 
          { onConflict: 'story_id,user_id' }
        );
      
      if (error) {
        // Silenziamo l'errore in console se è solo un problema di policy (già visto)
        if (!error.message.includes("policy")) {
          console.error("[Stories] Errore registrazione vista:", error.message);
        }
      }
    }
  });

  const getStoryViews = (storyId: string | null) => {
    const query = useQuery({
      queryKey: ['story-views', storyId],
      queryFn: async () => {
        if (!storyId) return [];
        const { data, error } = await supabase
          .from('story_views')
          .select(`
            *,
            profiles:user_id (username, avatar_url)
          `)
          .eq('story_id', storyId)
          .order('viewed_at', { ascending: false });
        
        if (error) throw error;
        return data;
      },
      enabled: !!storyId,
      staleTime: 0
    });

    useEffect(() => {
      if (!storyId) return;

      const channel = supabase
        .channel(`views-${storyId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'story_views',
            filter: `story_id=eq.${storyId}`
          },
          () => {
            query.refetch();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, [storyId]);

    return query;
  };

  const uploadStory = useMutation({
    mutationFn: async (files: File[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per caricare una storia");

      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `stories/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('post-media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('post-media')
          .getPublicUrl(filePath);

        const { error: dbError } = await supabase
          .from('stories')
          .insert([{ user_id: user.id, image_url: publicUrl }]);

        if (dbError) throw dbError;
        return publicUrl;
      });

      return Promise.all(uploadPromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-stories'] });
      showSuccess("Contenuto pubblicato nelle storie!");
    },
    onError: (error: any) => showError(error.message)
  });

  const deleteStory = useMutation({
    mutationFn: async (storyId: string) => {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-stories'] });
      showSuccess("Storia eliminata.");
    },
    onError: (error: any) => showError("Errore durante l'eliminazione")
  });

  return { stories, isLoading, uploadStory, deleteStory, recordView, getStoryViews };
};