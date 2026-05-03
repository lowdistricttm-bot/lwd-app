"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Story } from "@/types/story";
import { toast } from "sonner";

export const useStories = (userId?: string) => {
  const queryClient = useQueryClient();

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["active-stories"],
    queryFn: async () => {
      console.log("Fetching active stories...");
      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select(`
          *,
          user:profiles!stories_user_id_fkey(id, username, avatar_url),
          likes:story_likes(user_id)
        `)
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (storiesError) throw storiesError;

      const currentUserId = (await supabase.auth.getUser()).data.user?.id;

      return (storiesData || []).map((story) => ({
        ...story,
        is_liked: story.likes?.some((like: any) => like.user_id === currentUserId) || false,
        likes_count: story.likes?.length || 0,
      })) as Story[];
    },
  });

  const toggleStoryLike = useMutation({
    mutationFn: async ({ storyId, userId }: { storyId: string; userId: string }) => {
      // Controllo preventivo rapido
      const { data: existingLike } = await supabase
        .from("story_likes")
        .select("id")
        .eq("story_id", storyId)
        .eq("user_id", userId)
        .maybeSingle();

      if (existingLike) return "already_liked";

      const { error: likeError } = await supabase
        .from("story_likes")
        .insert({ story_id: storyId, user_id: userId });

      if (likeError) throw likeError;

      const { data: storyData } = await supabase
        .from("stories")
        .select("user_id")
        .eq("id", storyId)
        .single();

      if (storyData && storyData.user_id !== userId) {
        await supabase.from("messages").insert({
          sender_id: userId,
          receiver_id: storyData.user_id,
          content: "❤️ ha messo like alla tua storia",
          story_id: storyId,
        });
      }

      return "success";
    },
    onMutate: async ({ storyId }) => {
      // Blocca refetch in corso per non sovrascrivere l'update ottimistico
      await queryClient.cancelQueries({ queryKey: ["active-stories"] });
      const previousStories = queryClient.getQueryData<Story[]>(["active-stories"]);

      queryClient.setQueryData<Story[]>(["active-stories"], (old) => {
        if (!old) return [];
        return old.map((s) =>
          s.id === storyId ? { ...s, is_liked: true, likes_count: (s.likes_count || 0) + 1 } : s
        );
      });

      return { previousStories };
    },
    onError: (err, variables, context) => {
      if (context?.previousStories) {
        queryClient.setQueryData(["active-stories"], context.previousStories);
      }
      // Non mostriamo il toast di errore per il fetch fallito per non disturbare l'utente
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        console.warn("Rilevato Failed to fetch durante il like - operazione ignorata graficamente");
      } else {
        toast.error("Errore durante l'invio del like");
      }
    },
    onSettled: () => {
      // Invalida silenziosamente senza forzare il refresh immediato dell'UI
      queryClient.invalidateQueries({ queryKey: ["active-stories"], refetchType: 'none' });
    },
  });

  const deleteStory = useMutation({
    mutationFn: async (storyId: string) => {
      const { error } = await supabase.from("stories").delete().eq("id", storyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-stories"] });
      toast.success("Storia eliminata");
    },
    onError: () => {
      toast.error("Errore durante l'eliminazione della storia");
    },
  });

  return {
    stories,
    isLoading,
    toggleStoryLike,
    deleteStory,
  };
};