"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';
import { useEffect } from 'react';
import { compressImage, validateVideo } from '@/utils/media';
import { uploadToCloudinary } from '@/utils/cloudinary';

export interface Story {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  expires_at: string;
  mentions?: string[];
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

      if (error) return [];
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

  const uploadStory = useMutation({
    mutationFn: async ({ files, mentions = [] }: { files: File[], mentions?: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per caricare una storia");

      const uploadPromises = files.map(async (originalFile) => {
        let file = originalFile;
        if (file.type.startsWith('video/')) {
          const validation = await validateVideo(file);
          if (!validation.ok) throw new Error(validation.error);
        } else {
          file = await compressImage(file);
        }

        const publicUrl = await uploadToCloudinary(file);

        const { data: newStory, error: dbError } = await supabase
          .from('stories')
          .insert([{ 
            user_id: user.id, 
            image_url: publicUrl,
            mentions: mentions 
          }])
          .select()
          .single();

        if (dbError) throw dbError;

        // Invia DM ai menzionati
        if (mentions.length > 0) {
          const { data: myProfile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
          for (const mentionId of mentions) {
            await supabase.from('messages').insert([{
              sender_id: user.id,
              receiver_id: mentionId,
              content: `✨ Ti ha menzionato in una storia!`,
              image_url: publicUrl,
              images: [publicUrl]
            }]);
          }
        }

        return publicUrl;
      });

      return Promise.all(uploadPromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-stories'] });
      showSuccess("Storia pubblicata!");
    },
    onError: (error: any) => showError(error.message)
  });

  const reshareStory = useMutation({
    mutationFn: async (storyUrl: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per ricondividere");

      const { error } = await supabase
        .from('stories')
        .insert([{ 
          user_id: user.id, 
          image_url: storyUrl,
          mentions: [] // Reset menzioni nella ricondivisione
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-stories'] });
      showSuccess("Storia ricondivisa!");
    }
  });

  return { stories, isLoading, uploadStory, reshareStory };
};