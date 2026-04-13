"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
  likes_count?: number;
  is_liked?: boolean;
}

export const useSocialFeed = () => {
  const queryClient = useQueryClient();

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['social-posts'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      if (!postsData) return [];

      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', userIds);

      const enrichedPosts = await Promise.all(postsData.map(async (post: any) => {
        const profile = profilesData?.find(p => p.id === post.user_id);
        
        const { count: likes_count } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        let is_liked = false;
        if (user) {
          const { data: userLike } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .maybeSingle();
          is_liked = !!userLike;
        }

        const username = profile 
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Membro District'
          : 'Membro District';

        return {
          ...post,
          profiles: {
            username,
            avatar_url: profile?.avatar_url
          },
          likes_count: likes_count || 0,
          is_liked
        };
      }));

      return enrichedPosts as Post[];
    },
    retry: 1
  });

  const createPost = useMutation({
    mutationFn: async ({ content, image_url }: { content: string, image_url?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi accedere per pubblicare");

      // Creiamo l'oggetto di inserimento base
      const insertData: any = {
        user_id: user.id,
        content,
        created_at: new Date().toISOString()
      };

      // Aggiungiamo image_url solo se presente (evita errori se la colonna non esiste e non stiamo caricando foto)
      if (image_url) {
        insertData.image_url = image_url;
      }

      const { data, error } = await supabase
        .from('posts')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error("[Social] Errore creazione post:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      showSuccess("Post pubblicato nel District!");
    },
    onError: (error: any) => {
      if (error.message?.includes("image_url")) {
        showError("Errore database: colonna immagini mancante. Esegui il comando SQL fornito.");
      } else {
        showError(error.message);
      }
    }
  });

  const toggleLike = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per mettere like");

      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingLike) {
        await supabase.from('likes').delete().eq('id', existingLike.id);
      } else {
        await supabase.from('likes').insert([{ post_id: postId, user_id: user.id }]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
    },
    onError: (error: any) => showError(error.message)
  });

  return { posts, isLoading, error, createPost, toggleLike };
};