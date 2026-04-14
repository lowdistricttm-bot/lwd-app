"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url?: string;
  is_read: boolean;
  created_at: string;
  sender?: { username: string, avatar_url: string };
  receiver?: { username: string, avatar_url: string };
}

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['unread-messages-count'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);
      if (error) return 0;
      return count || 0;
    }
  });
};

export const useMessages = (otherUserId?: string) => {
  const queryClient = useQueryClient();

  const { data: conversations, isLoading: loadingConvs } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (username, avatar_url),
          receiver:receiver_id (username, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const groups = new Map();
      data.forEach(msg => {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!groups.has(otherId)) {
          // Una conversazione è non letta se l'ultimo messaggio è per me ed è is_read: false
          const isUnread = msg.receiver_id === user.id && !msg.is_read;
          
          groups.set(otherId, {
            lastMessage: msg,
            otherUser: msg.sender_id === user.id ? msg.receiver : msg.sender,
            otherId,
            isUnread
          });
        }
      });

      return Array.from(groups.values());
    }
  });

  const { data: chatMessages, isLoading: loadingChat } = useQuery({
    queryKey: ['chat', otherUserId],
    queryFn: async () => {
      if (!otherUserId) return [];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (username, avatar_url),
          receiver:receiver_id (username, avatar_url)
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!otherUserId
  });

  const uploadMedia = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `chat/${fileName}`;

    const { error } = await supabase.storage
      .from('post-media')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('post-media')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const sendMessage = useMutation({
    mutationFn: async ({ receiverId, content, file }: { receiverId: string, content: string, file?: File }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per inviare messaggi");

      let image_url = undefined;
      if (file) {
        image_url = await uploadMedia(file);
      }

      const { error } = await supabase
        .from('messages')
        .insert([{ 
          sender_id: user.id, 
          receiver_id: receiverId, 
          content,
          image_url 
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      if (otherUserId) queryClient.invalidateQueries({ queryKey: ['chat', otherUserId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  const deleteMessage = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      if (otherUserId) queryClient.invalidateQueries({ queryKey: ['chat', otherUserId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      showSuccess("Messaggio eliminato");
    },
    onError: () => showError("Errore durante l'eliminazione")
  });

  return { conversations, loadingConvs, chatMessages, loadingChat, sendMessage, deleteMessage };
};