import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useStories = () => {
  return useQuery({
    queryKey: ['supabase-stories'],
    queryFn: async () => {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          views:story_views(count)
        `)
        .gt('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60, // 1 minuto
  });
};

export const useViewStory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ storyId, userId }: { storyId: string, userId: string }) => {
      const { error } = await supabase
        .from('story_views')
        .upsert({ story_id: storyId, user_id: userId }, { onConflict: 'story_id,user_id' });
      
      if (error && error.code !== '23505') throw error; // Ignora errori di duplicato
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
    mutationFn: async ({ userId, imageUrl }: { userId: string, imageUrl: string }) => {
      const { data, error } = await supabase
        .from('stories')
        .insert([{ user_id: userId, image_url: imageUrl }])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase-stories'] });
    }
  });
};