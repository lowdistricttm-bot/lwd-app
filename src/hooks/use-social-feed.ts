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
  music_metadata?: any; // Aggiunto supporto musica
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

  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading, 
    error, 
    refetch 
  } = useInfiniteQuery({
    queryKey: ['social-posts', userId],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      const from = pageParam * limit;
      const to = from + limit - 1;
      
      let query = supabase
        .from('posts')
        .select(`
          id, user_id, content, image_url, images, music_metadata, created_at,
          profiles:user_id (id, username, avatar_url),
          likes (user_id, profiles:user_id (username, avatar_url)),
          comments (id, post_id, user_id, content, created_at, parent_id, image_url, profiles:user_id (id, username, avatar_url))
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: postsData, error: postsError } = await query;

      if (postsError) throw postsError;
      if (!postsData) return [];

      return postsData.map((post: any) => {
        const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
        const likes_count = post.likes?.length || 0;
        const is_liked = user ? post.likes?.some((l: any) => l.user_id === user.id) : false;
        const username = profile?.username || 'Membro District';
        
        const liked_by = post.likes?.map((l: any) => {
          const likerProfile = Array.isArray(l.profiles) ? l.profiles[0] : l.profiles;
          return {
            user_id: l.user_id,
            username: likerProfile?.username || 'Membro',
            avatar_url: likerProfile?.avatar_url
          };
        }) || [];

        return {
          ...post,
          images: Array.isArray(post.images) ? post.images : (post.image_url ? [post.image_url] : []),
          profiles: { username, avatar_url: profile?.avatar_url },
          likes_count,
          is_liked,
          liked_by,
          comments: post.comments?.map((c: any) => {
            const commentProfile = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
            return {
              ...c,
              profiles: {
                ...commentProfile,
                username: commentProfile?.username || 'Utente'
              }
            };
          }) || []
        };
      }) as Post[];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === limit ? allPages.length : undefined;
    },
    staleTime: 1000 * 60 * 2,
  });

  const posts = data?.pages.flat() || [];

  useEffect(() => {
    const channelId = `feed-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => queryClient.invalidateQueries({ queryKey: ['social-posts'] }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, () => queryClient.invalidateQueries({ queryKey: ['social-posts'] }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => queryClient.invalidateQueries({ queryKey: ['social-posts'] }))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const processAndUpload = async (file: File) => {
    if (file.type.startsWith('video/')) {
      const validation = await validateVideo(file);
      if (!validation.ok) throw new Error(validation.error);
    } else {
      file = await compressImage(file);
    }
    return await uploadToCloudinary(file);
  };

  const createPost = useMutation({
    mutationFn: async ({ content, files, music_metadata }: { content: string, files?: File[], music_metadata?: any }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi accedere per pubblicare");
      
      let imageUrls: string[] = [];
      if (files) {
        for (const file of files) {
          imageUrls.push(await processAndUpload(file));
        }
      }

      const { data, error } = await supabase.from('posts').insert([{ 
        user_id: user.id, 
        content, 
        images: imageUrls, 
        image_url: imageUrls[0] || null,
        music_metadata: music_metadata // Salvataggio musica
      }]).select('id').single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['social-posts'] }); 
      showSuccess("Post pubblicato!"); 
    },
    onError: (error: any) => showError(error.message)
  });

  const updatePost = useMutation({
    mutationFn: async ({ postId, content, files, removeImages, music_metadata }: { postId: string, content: string, files?: File[], removeImages?: boolean, music_metadata?: any }) => {
      let imageUrls: string[] = [];
      if (files && files.length > 0) {
        for (const file of files) imageUrls.push(await processAndUpload(file));
      }
      const updateData: any = { content };
      if (imageUrls.length > 0) {
        updateData.images = imageUrls;
        updateData.image_url = imageUrls[0];
      } else if (removeImages) {
        updateData.images = [];
        updateData.image_url = null;
      }
      
      // Aggiorna musica se fornita (o null se rimossa)
      if (music_metadata !== undefined) {
        updateData.music_metadata = music_metadata;
      }

      const { error } = await supabase.from('posts').update(updateData).eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['social-posts'] }); showSuccess("Post aggiornato!"); },
    onError: (error: any) => showError(error.message)
  });

  // ... (restante codice addComment, deletePost, toggleLike invariato)
  const addComment = useMutation({
    mutationFn: async ({ postId, content, parentId, file }: { postId: string, content: string, parentId?: string, file?: File }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per commentare");
      let image_url = null;
      if (file) image_url = await processAndUpload(file);
      const { error } = await supabase.from('comments').insert([{ post_id: postId, user_id: user.id, content, parent_id: parentId, image_url }]);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['social-posts'] }); showSuccess("Commento aggiunto!"); },
    onError: (error: any) => showError(error.message)
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      await supabase.from('likes').delete().eq('post_id', postId);
      await supabase.from('comments').delete().eq('post_id', postId);
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['social-posts'] }); showSuccess("Post eliminato"); }
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['social-posts'] }); }
  });

  const toggleLike = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per mettere like");
      const { data: existingLike } = await supabase.from('likes').select('id').eq('post_id', postId).eq('user_id', user.id).maybeSingle();
      if (existingLike) await supabase.from('likes').delete().eq('id', existingLike.id);
      else await supabase.from('likes').insert([{ post_id: postId, user_id: user.id }]);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['social-posts'] })
  });

  return { 
    posts, 
    isLoading, 
    error, 
    refetch, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    createPost, 
    updatePost, 
    addComment, 
    deletePost, 
    deleteComment, 
    toggleLike 
  };
};

export const usePost = (postId?: string) => {
  return useQuery({
    queryKey: ['social-post', postId],
    queryFn: async () => {
      if (!postId) return null;
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      const { data: post, error } = await supabase.from('posts').select(`id, user_id, content, image_url, images, music_metadata, created_at, profiles:user_id (id, username, first_name, last_name, avatar_url), likes (user_id, profiles:user_id (username, avatar_url)), comments (id, post_id, user_id, content, created_at, parent_id, image_url, profiles:user_id (id, username, avatar_url))`).eq('id', postId).maybeSingle();
      if (error) throw error;
      if (!post) return null;
      const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
      return { ...post, images: Array.isArray(post.images) ? post.images : (post.image_url ? [post.image_url] : []), profiles: { username: profile?.username || 'Membro District', avatar_url: profile?.avatar_url }, likes_count: post.likes?.length || 0, is_liked: user ? post.likes?.some((l: any) => l.user_id === user.id) : false, comments: post.comments || [] } as Post;
    },
    enabled: !!postId,
    retry: 1
  });
};