"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Story {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  expires_at: string;
  status: string;
  is_liked?: boolean;
  likes_count?: number;
  user?: {
    id: string;
    username: string;
    avatar_url: string;
  };
}

export const useStories = (userId?: string) => {
  const queryClient = useQueryClient();

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["active-stories"],
    queryFn: async () => {
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

      const { data: { user: authUser } } = await supabase.auth.getUser();
      const currentUserId = authUser?.id;

      const flatStories = (storiesData || []).map((story) => ({
        ...story,
        is_liked: story.likes?.some((like: any) => like.user_id === currentUserId) || false,
        likes_count: story.likes?.length || 0,
      })) as Story[];

      // RAGGRUPPAMENTO PER UTENTE (Essenziale per Stories.tsx)
      const groups: any[] = [];
      flatStories.forEach((story) => {
        let group = groups.find(g => g.user_id === story.user_id);
        if (!group) {
          group = {
            user_id: story.user_id,
            username: story.user?.username || 'Membro District',
            avatar_url: story.user?.avatar_url,
            items: []
          };
          groups.push(group);
        }
        group.items.push(story);
      });

      return groups;
    },
  });

  const toggleStoryLike = useMutation({
    mutationFn: async ({ storyId, userId }: { storyId: string; userId: string }) => {
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

      const { data: storyData } = await supabase.from("stories").select("user_id").eq("id", storyId).single();
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
      await queryClient.cancelQueries({ queryKey: ["active-stories"] });
      const previousStories = queryClient.getQueryData<any[]>(["active-stories"]);

      queryClient.setQueryData<any[]>(["active-stories"], (old) => {
        if (!old) return [];
        return old.map(group => ({
          ...group,
          items: group.items.map