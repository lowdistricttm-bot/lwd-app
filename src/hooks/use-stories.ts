"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';
import { compressImage, validateVideo } from '@/utils/media';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { useAuth } from './use-auth';

export interface Story {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  expires_at: string;
  mentions?: string[];
  music_metadata?: any; // Aggiunto per la musica
  reshared_from_profile_id?: string;
  reshared_from?: {
    username: string;
  };
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
  const { user } = useAuth();

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
          ),
          reshared_from:reshared_from_profile_id (
            username
          ),
          story_likes (user_id)
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        if (error.message?.includes('AbortError') || error.message?.includes('Lock broken')) {
          return [];
        }
        console.error("[Stories] Errore caricamento:", error);
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
      
      const isLiked = user ? story.story_likes?.some((l: any) => l.user_id === user.id) : false;

      acc[story.user_id].items.push({
        ...story,
        mentions: Array.isArray(story.mentions) ? story.mentions : [],
        is_liked: isLiked
      });
      return acc;
    }, {});
    return Object.values(grouped);
  };

  const uploadStory = useMutation({
    // Aggiornato per accettare music_metadata
    mutationFn: async ({ files, music_metadata }: { files: File[], music_metadata?: any }) => {
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
            mentions: [],
            music_metadata: music_metadata // Salvataggio metadati musicali
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

  const toggleStoryLike = useMutation({
    mutationFn: async ({ storyId, authorId, imageUrl, isCurrentlyLiked }: { storyId: string, authorId: string, imageUrl: string, isCurrentlyLiked: boolean }) => {
      if (!user) throw new Error("Accedi per mettere like");
      
      if (isCurrentlyLiked) return 'already_liked';

      // 1. Inserisci il like nel database
      const { error: likeError } = await supabase
        .from('story_likes')
        .insert([{ story_id: storyId, user_id: user.id }]);
      
      if (likeError) {
        if (likeError.code === '23505') return 'already_liked';
        throw likeError;
      }

      // 2. Invia il messaggio in direct (DM)
      const { error: msgError } = await supabase.from('messages').insert([{
        sender_id: user.id,
        receiver_id: authorId,
        content: "❤️ Ha messo like alla tua storia",
        image_url: imageUrl,
        images: [imageUrl]
      }]);

      if (msgError) {
        console.warn("[Stories] Errore invio notifica DM:", msgError);
      }

      return 'liked';
    },
    onMutate: async ({ storyId }) => {
      await queryClient.cancelQueries({ queryKey: ['active-stories'] });
      const previousStories = queryClient.getQueryData(['active-stories']);

      queryClient.setQueryData(['active-stories'], (old: any) => {
        if (!old) return old;
        return old.map((userGroup: any) => ({
          ...userGroup,
          items: userGroup.items.map((item: any) => {
            if (item.id === storyId) {
              return { ...item, is_liked: true };
            }
            return item;
          })
        }));
      });

      return { previousStories };
    },
    onError: (err: any, variables, context) => {
      if (context?.previousStories) {
        queryClient.setQueryData(['active-stories'], context.previousStories);
      }
      showError(err.message || "Errore durante il like");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['active-stories'] });
    }
  });

  const addMention = useMutation({
    mutationFn: async ({ storyId, mentionId, storyUrl }: { storyId: string, mentionId: string, storyUrl: string }) => {
      if (!user) throw new Error("Accedi per menzionare");

      const { data: story } = await supabase.from('stories').select('mentions').eq('id', storyId).single();
      const currentMentions = Array.isArray(story?.mentions) ? story.mentions : [];
      
      if (!currentMentions.includes(mentionId)) {
        const { error: updateError } = await supabase
          .from('stories')
          .update({ mentions: [...currentMentions, mentionId] })
          .eq('id', storyId);

        if (updateError) throw updateError;
      }

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
      if (!user) return;
      try {
        // Usiamo upsert per registrare la visualizzazione
        await supabase
          .from('story_views')
          .upsert([{ story_id: storyId, user_id: user.id }], { onConflict: 'story_id, user_id' });
      } catch (err) {
        // Errore silenzioso per non disturbare l'utente se il tracciamento fallisce
        console.warn("[Stories] Impossibile registrare visualizzazione:", storyId);
      }
    }
  });

  const reshareStory = useMutation({
    mutationFn: async ({ storyUrl, originalAuthorId, music_metadata }: { storyUrl: string, originalAuthorId: string, music_metadata?: any }) => {
      if (!user) throw new Error("Accedi per ricondividere");

      const { error } = await supabase
        .from('stories')
        .insert([{ 
          user_id: user.id, 
          image_url: storyUrl,
          mentions: [],
          reshared_from_profile_id: originalAuthorId, music_metadata: music_metadata
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-stories'] });
      showSuccess("Storia ricondivisa!");
    },
    onError: (error: any) => showError(error)
  });

  return { stories, isLoading, uploadStory, addMention, deleteStory, recordView, reshareStory, toggleStoryLike };
};