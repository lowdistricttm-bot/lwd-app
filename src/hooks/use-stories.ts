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

      const currentUserId = (await supabase.auth.getUser()).data.user?.id;

      const mappedStories = (storiesData || []).map((story) => ({
        ...story,
        is_liked: story.likes?.some((like: any) => like.user_id === currentUserId) || false,
        likes_count: story.likes?.length || 0,
      })) as Story[];

      // RAGGRUPPAMENTO PER UTENTE: Necessario per Stories.tsx
      const groups = mappedStories.reduce((acc: any[], story) => {
        const existingGroup = acc.find(g => g.user_id === story.user_id);
        if (existingGroup) {
          existingGroup.items.push(story);
        } else {
          acc.push({
            user_id: story.user_id,
            username: story.user?.username || 'Unknown',
            avatar_url: story.user?.avatar_url,
            items: [story]
          });
        }
        return acc;
      }, []);

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

      await supabase.from("story_likes").insert({ story_id: storyId, user_id: userId });

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
        return old.map((group) => ({
          ...group,
          items: group.items.map((s: Story) => 
            s.id === storyId ? { ...s, is_liked: true, likes_count: (s.likes_count || 0) + 1 } : s
          )
        }));
      });
      return { previousStories };
    },
    onError: (err, variables, context) => {
      if (context?.previousStories) queryClient.setQueryData(["active-stories"], context.previousStories);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["active-stories"], refetchType: 'none' });
    },
  });

  const uploadStory = useMutation({
    mutationFn: async ({ files, music_metadata }: { files: File[], music_metadata?: any }) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Non autenticato");

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('stories').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('stories').getPublicUrl(filePath);
        await supabase.from('stories').insert({
          user_id: user.id,
          image_url: publicUrl,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          music_metadata
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-stories"] });
      toast.success("Storia pubblicata!");
    }
  });

  const deleteStory = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("stories").delete().eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["active-stories"] })
  });

  const reshareStory = useMutation({
    mutationFn: async (data: { storyUrl: string; originalAuthorId: string; music_metadata?: any }) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Non autenticato");

      await supabase.from("stories").insert({
        user_id: user.id,
        image_url: data.storyUrl,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        music_metadata: data.music_metadata
      });
      
      await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: data.originalAuthorId,
        content: "Ha aggiunto la tua storia alla sua!",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-stories"] });
      toast.success("Storia aggiunta!");
    }
  });

  const addMention = useMutation({
    mutationFn: async (data: { storyId: string; mentionId: string; storyUrl: string; music_metadata?: any }) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Non autenticato");

      await supabase.from("story_mentions").insert({
        story_id: data.storyId,
        user_id: data.mentionId
      });

      await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: data.mentionId,
        content: `Ti ha menzionato in una storia!`,
        images: [{ url: data.storyUrl, music_metadata: data.music_metadata }]
      });
    },
    onSuccess: () => toast.success("Membro menzionato!")
  });

  return { stories, isLoading, toggleStoryLike, deleteStory, uploadStory, reshareStory, addMention };
};