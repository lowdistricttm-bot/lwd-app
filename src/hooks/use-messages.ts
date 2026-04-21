"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from '@/utils/toast';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { useAuth } from './use-auth';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url?: string;
  images?: string[];
  is_read: boolean;
  created_at: string;
  sender?: { username: string, avatar_url: string };
  receiver?: { username: string, avatar_url: string };
  is_optimistic?: boolean;
}

export const useMessages = (otherUserId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Query per la lista delle conversazioni
  const { data: conversations, isLoading: loadingConvs } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
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
          groups.set(otherId, {
            lastMessage: msg,
            otherUser: msg.sender_id === user.id ? msg.receiver : msg.sender,
            otherId
          });
        }
      });
      return Array.from(groups.values());
    },
    enabled: !!user,
  });

  // Query per il conteggio messaggi non letti
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-messages-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);
      if (error) return 0;
      return count || 0;
    },
    enabled: !!user,
  });

  // Query per i messaggi di una singola chat
  const { data: chatMessages, isLoading: loadingChat } = useQuery({
    queryKey: ['chat', otherUserId, user?.id],
    queryFn: async () => {
      if (!otherUserId || !user) return [];
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
      return data.map((msg: any) => ({
        ...msg,
        images: Array.isArray(msg.images) ? msg.images : (msg.image_url ? [msg.image_url] : [])
      })) as Message[];
    },
    enabled: !!otherUserId && !!user,
  });

  const sendMessage = useMutation({
    mutationFn: async ({ receiverId, content, files, imageUrl }: { receiverId: string, content: string, files?: File[], imageUrl?: string }) => {
      if (!user) throw new Error("Accedi per inviare messaggi");

      let imageUrls: string[] = [];
      if (imageUrl) {
        imageUrls = [imageUrl];
      } else if (files && files.length > 0) {
        for (const file of files) {
          const url = await uploadToCloudinary(file);
          imageUrls.push(url);
        }
      }

      const { data, error } = await supabase
        .from('messages')
        .insert([{ 
          sender_id: user.id, 
          receiver_id: receiverId, 
          content,
          images: imageUrls,
          image_url: imageUrls[0] || null 
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (variables) => {
      const chatKey = ['chat', variables.receiverId, user?.id];
      await queryClient.cancelQueries({ queryKey: chatKey });
      const previousChat = queryClient.getQueryData(chatKey);

      queryClient.setQueryData(chatKey, (old: any) => [
        ...(old || []),
        {
          id: 'temp-' + Date.now(),
          sender_id: user?.id,
          receiver_id: variables.receiverId,
          content: variables.content,
          image_url: variables.imageUrl,
          images: variables.imageUrl ? [variables.imageUrl] : [],
          created_at: new Date().toISOString(),
          is_read: false,
          is_optimistic: true
        }
      ]);

      return { previousChat };
    },
    onError: (err, variables, context) => {
      if (context?.previousChat) {
        queryClient.setQueryData(['chat', variables.receiverId, user?.id], context.previousChat);
      }
      showError("Errore nell'invio");
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat', variables.receiverId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    }
  });

  const markAsRead = useMutation({
    mutationFn: async (senderId: string) => {
      if (!user) return;
      await supabase.from('messages').update({ is_read: true }).eq('receiver_id', user.id).eq('sender_id', senderId).eq('is_read', false);
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['unread-messages-count', user?.id] }); 
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    }
  });

  const deleteMessage = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase.from('messages').delete().eq('id', messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
      if (otherUserId) queryClient.invalidateQueries({ queryKey: ['chat', otherUserId, user?.id] });
    }
  });

  const deleteConversation = useMutation({
    mutationFn: async (otherId: string) => {
      if (!user) return;
      const { error } = await supabase
        .from('messages')
        .delete()
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages-count', user?.id] });
      showSuccess("Conversazione eliminata");
    },
    onError: (err: any) => showError(err.message)
  });

  return { conversations, unreadCount, loadingConvs, chatMessages, loadingChat, sendMessage, markAsRead, deleteMessage, deleteConversation };
};