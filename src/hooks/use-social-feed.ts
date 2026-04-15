"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  images?: string[];
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
      
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (id, username, first_name, last_name, avatar_url),
          likes (user_id),
          comments (*, profiles:user_id (id, username, first_name, last_name, avatar_url))
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      if (!postsData) return [];

      return postsData.map((post: any) => {
        const profile = post.profiles;
        const likes_count = post.likes?.length || 0;
        const is_liked = user ? post.likes?.some((l: any) => l.user_id === user.id) : false;
        const username = profile?.username || 'Membro District';

        return {
          ...post,
          images: Array.isArray(post.images) ? post.images : (post.image_url ? [post.image_url] : []),
          profiles: { username, avatar_url: profile?.avatar_url },
          likes_count,
          is_liked,
          comments: post.comments?.map((c: any) => ({
            ...c,
            profiles: {
              ...c.profiles,
              username: c.profiles?.username || 'Membro'
            }
          })) || []
        };
      }) as Post[];
    }
  });

  const uploadMedia = async (file: File, folder: string = 'posts') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from('post-media')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('post-media')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const createPost = useMutation({
    mutationFn: async ({ content, files }: { content: string, files?: File[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi accedere per pubblicare");

      let imageUrls: string[] = [];
      if (files && files.length > 0) {
        for (const file of files) {
          const url = await uploadMedia(file);
          imageUrls.push(url);
        }
      }

      const { data, error } = await supabase
        .from('posts')
        .insert([{ 
          user_id: user.id, 
          content, 
          images: imageUrls,
          image_url: imageUrls[0] || null 
        }])
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
    mutationFn: async ({ postId, content, parentId, file }: { postId: string, content: string, parentId?: string, file?: File }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per commentare");

      let image_url = null;
      if (file) {
        image_url = await uploadMedia(file, 'comments');
      }

      const { error } = await supabase
        .from('comments')
        .insert([{ 
          post_id: postId, 
          user_id: user.id, 
          content, 
          parent_id: parentId,
          image_url
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      showSuccess("Commento aggiunto!");
    },
    onError: (error: any) => showError(error.message)
  });

  // ... rest of the hook (updatePost, deletePost, toggleLike, deleteComment)
  const updatePost = useMutation({
    mutationFn: async ({ postId, content, files, removeImages }: { postId: string, content: string, files?: File[], removeImages?: boolean }) => {
      let imageUrls: string[] = [];
      if (files && files.length > 0) {
        for (const file of files) {
          const url = await uploadMedia(file);
          imageUrls.push(url);
        }
      }

      const updateData: any = { content };
      if (imageUrls.length > 0) {
        updateData.images = imageUrls;
        updateData.image_url = imageUrls[0];
      } else if (removeImages) {
        updateData.images = [];
        updateData.image_url = null;
      }

      const { error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      showSuccess("Post aggiornato!");
    },
    onError: (error: any) => showError(error.message)
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      await supabase.from('likes').delete().eq('post_id', postId);
      await supabase.from('comments').delete().eq('post_id', postId);
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      showSuccess("Post eliminato");
    }
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
    }
  });

  const toggleLike = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per mettere like");
      const { data: existingLike } = await supabase.from('likes').select('id').eq('post_id', postId).eq('user_id', user.id).maybeSingle();
      if (existingLike) await supabase.from('likes').delete().eq('id', existingLike.id);
      else await supabase.from('likes').insert([{ post_id: postId, user_id: user.id }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
    }
  });

  return { posts, isLoading, error, createPost, updatePost, deletePost, toggleLike, addComment, deleteComment };
};