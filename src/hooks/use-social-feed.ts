"use client";

import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from 'react';
import { showError, showSuccess } from '@/utils/toast';
import { compressImage, validateVideo } from '@/utils/media';
import { uploadToCloudinary } from '@/utils/cloudinary';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  images?: string[];
  music_metadata?: any;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
  likes_count?: number;
  is_liked?: boolean;
  liked_by?: { user_id: string; username: string; avatar_url?: string }[];
  comments?: any[];
}

export const useSocialFeed = (userId?: string, limit = 10) => {
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error, refetch } = useInfiniteQuery({
    queryKey: ['social-posts', userId],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      const from = pageParam * limit;
      const to = from + limit - 1;
      
      let query = supabase.from('posts').select(`
          id, user_id, content, image_url, images, music_metadata, created_at,
          profiles:user_id (id, username, avatar_url),
          likes (user_id, profiles:user_id (username, avatar_url)),
          comments (id, post_id, user_id, content, created_at, parent_id, image_url, profiles:user_id (id, username, avatar_url))
        `).order('created_at', { ascending: false }).range(from, to);

      if (userId) query = query.eq('user_id', userId);
      const { data: postsData, error: postsError } = await query;
      if (postsError) throw postsError;
      if (!postsData) return [];

      return postsData.map((post: any) => {
        const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
        const rawLikes = post.likes || [];
        const uniqueLikesMap = new Map();
        rawLikes.forEach((l: any) => {
          if (!uniqueLikesMap.has(l.user_id)) {
            const likerProfile = Array.isArray(l.profiles) ? l.profiles[0] : l.profiles;
            uniqueLikesMap.set(l.user_id, {
              user_id: l.user_id,
              username: likerProfile?.username || 'Membro',
              avatar_url: likerProfile?.avatar_url
            });
          }
        });
        const liked_by = Array.from(uniqueLikesMap.values());
        return {
          ...post,
          images: Array.isArray(post.images) ? post.images : (post.image_url ? [post.image_url] : []),
          profiles: { username: profile?.username || 'Membro District', avatar_url: profile?.avatar_url },
          likes_count: liked_by.length,
          is_liked: user ? uniqueLikesMap.has(user.id) : false,
          liked_by,
          comments: post.comments?.filter((c: any, idx: number, self: any[]) => self.findIndex(t => t.id === c.id) === idx) || []
        };
      }) as Post[];
    },
    getNextPageParam: (lastPage, allPages) => lastPage.length === limit ? allPages.length : undefined,
    staleTime: 1000 * 60 * 2,
  });

  const allPosts = data?.pages.flat() || [];
  const posts = allPosts.filter((post, index, self) => index === self.findIndex((p) => p.id === post.id));

  return { posts, isLoading, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage, toggleLike: useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per mettere like");
      const { data: existingLike } = await supabase.from('likes').select('id').eq('post_id', postId).eq('user_id', user.id).maybeSingle();
      if (existingLike) await supabase.from('likes').delete().eq('id', existingLike.id);
      else await supabase.from('likes').insert([{ post_id: postId, user_id: user.id }]);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['social-posts'] })
  }), deletePost: useMutation({
    mutationFn: async (postId: string) => {
      await supabase.from('likes').delete().eq('post_id', postId);
      await supabase.from('comments').delete().eq('post_id', postId);
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['social-posts'] }); showSuccess("Post eliminato"); }
  }), addComment: useMutation({
    mutationFn: async ({ postId, content, parentId, file }: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per commentare");
      let image_url = null;
      if (file) image_url = await uploadToCloudinary(file);
      const { error } = await supabase.from('comments').insert([{ post_id: postId, user_id: user.id, content, parent_id: parentId, image_url }]);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['social-posts'] }); showSuccess("Commento aggiunto!"); }
  }), deleteComment: useMutation({
    mutationFn: async (commentId: string) => { await supabase.from('comments').delete().eq('id', commentId); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['social-posts'] }); }
  })};
};