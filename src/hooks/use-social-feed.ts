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
  comments?: any[];
}

export const useSocialFeed = () => {
  const queryClient = useQueryClient();

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['social-posts'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      // 1. Carica i post
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      if (!postsData) return [];

      // 2. Carica i profili degli autori dei post
      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', userIds);

      // 3. Carica i commenti per questi post
      const postIds = postsData.map(p => p.id);
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*, profiles(first_name, last_name, avatar_url)')
        .in('post_id', postIds)
        .order('created_at', { ascending: true });

      // 4. Arricchisci ogni post con i suoi dati
      const enrichedPosts = await Promise.all(postsData.map(async (post: any) => {
        const profile = profilesData?.find(p => p.id === post.user_id);
        
        // Conta i like
        const { count: likes_count } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);
        
        // Verifica se l'utente attuale ha messo like
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
          is_liked,
          comments: commentsData?.filter(c => c.post_id === post.id) || []
        };
      }));

      return enrichedPosts as Post[];
    }
  });

  const uploadMedia = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('post-media')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('post-media')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const createPost = useMutation({
    mutationFn: async ({ content, file }: { content: string, file?: File }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi accedere per pubblicare");

      let image_url = undefined;
      if (file) {
        image_url = await uploadMedia(file);
      }

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
      showSuccess("Post pubblicato!");
    },
    onError: (error: any) => showError(error.message)
  });

  const addComment = useMutation({
    mutationFn: async ({ postId, content }: { postId: string, content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per commentare");

      const { error } = await supabase
        .from('comments')
        .insert([{ post_id: postId, user_id: user.id, content }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      showSuccess("Commento aggiunto!");
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
    }
  });

  return { posts, isLoading, error, createPost, toggleLike, addComment };
};