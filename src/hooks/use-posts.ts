import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePosts = () => {
  return useInfiniteQuery({
    queryKey: ['supabase-posts'],
    queryFn: async ({ pageParam = 0 }) => {
      // Usiamo una query più esplicita per evitare problemi di cache dello schema
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          image_url,
          user_id,
          user_name,
          user_avatar,
          created_at,
          likes:post_likes(count),
          comments:post_comments(count)
        `)
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + 9);

      if (error) {
        console.error("[Supabase Fetch Error]:", error);
        throw error;
      }
      return data || [];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length * 10 : undefined;
    },
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newPost: { 
      content: string, 
      user_id: string, 
      user_name: string, 
      user_avatar: string, 
      image_url?: string 
    }) => {
      const { data, error } = await supabase
        .from('posts')
        .insert([newPost])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase-posts'] });
    }
  });
};

export const usePostInteractions = (postId: string) => {
  const queryClient = useQueryClient();

  const { data: likes } = useQuery({
    queryKey: ['post-likes', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_likes')
        .select('user_id')
        .eq('post_id', postId);
      if (error) throw error;
      return data;
    }
  });

  const likeMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data: existing } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        return supabase.from('post_likes').delete().eq('id', existing.id);
      } else {
        return supabase.from('post_likes').insert([{ post_id: postId, user_id: userId }]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase-posts'] });
      queryClient.invalidateQueries({ queryKey: ['post-likes', postId] });
    }
  });

  return { likes, toggleLike: likeMutation.mutate };
};

export const useComments = (postId: string) => {
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['post-comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const addComment = useMutation({
    mutationFn: async (comment: { user_id: string, user_name: string, user_avatar: string, content: string }) => {
      return supabase.from('post_comments').insert([{ ...comment, post_id: postId }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase-posts'] });
      queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
    }
  });

  return { comments, isLoading, addComment: addComment.mutate };
};