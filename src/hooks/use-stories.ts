"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';
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

export const useStoryViews = (storyId: string | null) => {
  return useQuery({
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
    enabled: !!storyId
  });
};

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
    mutationFn: async ({ files }: { files: File[] }) => {
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

        const { error: dbError } = await supabase
          .from('stories')
          .insert([{ 
            user_id: user.id, 
            image_url: publicUrl,
            mentions: [] 
          }]);

        if (dbError) throw dbError;
        return publicUrl;
      });

      return Promise.all(uploadPromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-stories'] });
      showSuccess("Storia pubblicata!");
    },
    onError: (error: any) => showError(error)
  });

  const addMention = useMutation({
    mutationFn: async ({ storyId, mentionId, storyUrl }: { storyId: string, mentionId: string, storyUrl: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per menzionare");

      // 1. Recupera menzioni attuali
      const { data: story } = await supabase.from('stories').select('mentions').eq('id', storyId).single();
      const currentMentions = Array.isArray(story?.mentions) ? story.mentions : [];
      
      if (currentMentions.includes(mentionId)) throw new Error("Utente già menzionato");

      // 2. Aggiorna DB
      const { error: updateError } = await supabase
        .from('stories')
        .update({ mentions: [...currentMentions, mentionId] })
        .eq('id', storyId);

      if (updateError) throw updateError;

      // 3. Invia Direct
      await supabase.from('messages').insert([{
        sender_id: user.id,
        receiver_id: mentionId,
        content: `✨ Ti ha menzionato in una storia!`,
        image_url: storyUrl,
        images: [storyUrl]
      }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-stories'] });
      showSuccess("Menzione inviata!");
    },
    onError: (error: any) => showError(error)
  });

  const deleteStory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('stories').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-stories'] });
      showSuccess("Storia eliminata");
    },
    onError: (error: any) => showError(error)
  });

  const recordView = useMutation({
    mutationFn: async (storyId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await supabase
        .from('story_views')
        .upsert([{ story_id: storyId, user_id: user.id }], { onConflict: 'story_id, user_id' });
    }
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
          mentions: []
        }]);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-stories'] });
      showSuccess("Storia ricondivisa!");
    },
    onError: (error: any) => showError(error)
  });

  return { stories, isLoading, uploadStory, addMention, deleteStory, recordView, reshareStory };
};