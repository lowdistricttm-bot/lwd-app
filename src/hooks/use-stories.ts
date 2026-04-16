"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';

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

  const checkVideoDuration = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('video/')) return resolve(true);
      
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration <= 31); // 30 secondi + 1 di tolleranza
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const uploadStory = useMutation({
    mutationFn: async (files: File[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per caricare una storia");

      const uploadPromises = files.map(async (file) => {
        if (file.type.startsWith('video/')) {
          const isDurationOk = await checkVideoDuration(file);
          if (!isDurationOk) throw new Error(`Il video "${file.name}" supera i 30 secondi.`);
        }

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

  return { stories, isLoading, uploadStory, deleteStory };
};