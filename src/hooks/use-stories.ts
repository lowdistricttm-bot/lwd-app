import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useStories = () => {
  return useQuery({
    queryKey: ['supabase-stories'],
    queryFn: async () => {
      try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        
        const { data, error } = await supabase
          .from('stories')
          .select(`
            *,
            views:story_views(count)
          `)
          .gt('created_at', twentyFourHoursAgo)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn("[Stories] Query error, falling back to simple select:", error);
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('stories')
            .select('*')
            .gt('created_at', twentyFourHoursAgo)
            .order('created_at', { ascending: false });
          
          if (fallbackError) throw fallbackError;
          return fallbackData || [];
        }
        return data || [];
      } catch (err) {
        console.error("[Stories] Critical error:", err);
        return [];
      }
    },
    staleTime: 0, // Impostato a 0 per vedere i cambiamenti immediatamente
    gcTime: 0,
    retry: 1
  });
};

export const useViewStory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ storyId, userId }: { storyId: string, userId: string }) => {
      const { error } = await supabase
        .from('story_views')
        .upsert({ story_id: storyId, user_id: userId }, { onConflict: 'story_id,user_id' });
      
      if (error && error.code !== '23505') throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase-stories'] });
    }
  });
};

export const useCreateStory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, userName, imageUrl }: { userId: number, userName: string, imageUrl: string }) => {
      const { data, error } = await supabase
        .from('stories')
        .insert([{ 
          user_id: userId, 
          user_name: userName,
          image_url: imageUrl 
        }])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase-stories'] });
    }
  });
};

export const useDeleteStory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (storyId: string) => {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase-stories'] });
    }
  });
};