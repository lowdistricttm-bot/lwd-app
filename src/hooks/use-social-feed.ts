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
      const { data: { user } } = await supabase.auth.getUser();
      
      // Recupero post e info profilo associate
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (first_name, last_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Verifico i like per l'utente corrente
      const postsWithLikes = await Promise.all((data || []).map(async (post: any) => {
        let is_liked = false;
        let likes_count = 0;

        // Conteggio like (approssimativo per semplicità)
        const { count } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        likes_count = count || 0;

        if (user) {
          const { data: userLike } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .maybeSingle();
          is_liked = !!userLike;
        }

        return {
          ...post,
          profiles: {
            username: post.profiles ? `${post.profiles.first_name || ''} ${post.profiles.last_name || ''}`.trim() || 'Membro' : 'Membro',
            avatar_url: post.profiles?.avatar_url
          },
          likes_count,
          is_liked
        };
      }));

      return postsWithLikes as Post[];
    }
  });

  const createPost = useMutation({
    mutationFn: async ({ content, image_url }: { content: string, image_url?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi accedere per pubblicare");

      const { data, error } = await supabase
        .from('posts')
        .insert([{ user_id: user.id, content, image_url }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      showSuccess("Post pubblicato nel District!");
    },
    onError: (error: any) => showError(error.message)
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