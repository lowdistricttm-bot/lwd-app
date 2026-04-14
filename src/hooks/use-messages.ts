"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from 'react';
import { showSuccess, showError } from '@/utils/toast';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: { username: string, avatar_url: string };
  receiver?: { username: string, avatar_url: string };
}

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
          groups.set(otherId, {
            lastMessage: msg,
            otherUser: msg.sender_id === user.id ? msg.receiver : msg.sender,
            otherId
          });
        }
      });

      return Array.from(groups.values());
    }
  });

  const { data: unreadCount = 0 } = useQuery({
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

  // Sottoscrizione Realtime ultra-veloce
  useEffect(() => {
    if (!otherUserId) return;

    const channel = supabase
      .channel(`chat-${otherUserId}`)
      .on(
        'postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages'
        }, 
        () => {
          // Invalida immediatamente le query per forzare il refresh dei dati
          queryClient.invalidateQueries({ queryKey: ['chat', otherUserId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [otherUserId, queryClient]);

  const sendMessage = useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: string, content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per inviare messaggi");

      const { error } = await supabase
        .from('messages')
        .insert([{ sender_id: user.id, receiver_id: receiverId, content }]);

      if (error) throw error;
    },
    // Aggiornamento ottimistico per feedback istantaneo
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({ queryKey: ['chat', otherUserId] });
      const previousMessages = queryClient.getQueryData(['chat', otherUserId]);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && otherUserId) {
        queryClient.setQueryData(['chat', otherUserId], (old: any) => [
          ...(old || []),
          {
            id: 'temp-' + Date.now(),
            sender_id: user.id,
            receiver_id: newMessage.receiverId,
            content: newMessage.content,
            created_at: new Date().toISOString(),
            is_read: false
          }
        ]);
      }
      
      return { previousMessages };
    },
    onError: (err, newMessage, context: any) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['chat', otherUserId], context.previousMessages);
      }
      showError("Errore nell'invio del messaggio");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', otherUserId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  const markAsRead = useMutation({
    mutationFn: async (senderId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', user.id)
        .eq('sender_id', senderId)
        .eq('is_read', false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
    }
  });

  const deleteMessage = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase.from('messages').delete().eq('id', messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
      if (otherUserId) queryClient.invalidateQueries({ queryKey: ['chat', otherUserId] });
    }
  });

  const deleteConversation = useMutation({
    mutationFn: async (otherId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('messages')
        .delete()
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
      showSuccess("Conversazione eliminata");
    }
  });

  return { conversations, unreadCount, loadingConvs, chatMessages, loadingChat, sendMessage, markAsRead, deleteMessage, deleteConversation };
};