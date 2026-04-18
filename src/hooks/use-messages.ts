"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from 'react';
import { showSuccess, showError } from '@/utils/toast';
import { compressImage, validateVideo } from '@/utils/media';
import { uploadToCloudinary } from '@/utils/cloudinary';

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
      
      return data.map((msg: any) => ({
        ...msg,
        images: Array.isArray(msg.images) ? msg.images : (msg.image_url ? [msg.image_url] : [])
      })) as Message[];
    },
    enabled: !!otherUserId
  });

  useEffect(() => {
    const instanceId = Math.random().toString(36).substring(2, 9);
    const channelName = `messages-realtime-${otherUserId || 'list'}-${instanceId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' }, 
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
          if (otherUserId) {
            queryClient.invalidateQueries({ queryKey: ['chat', otherUserId] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [otherUserId, queryClient]);

  const sendMessage = useMutation({
    mutationFn: async ({ receiverId, content, files, imageUrl }: { receiverId: string, content: string, files?: File[], imageUrl?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Accedi per inviare messaggi");

      let imageUrls: string[] = [];
      
      if (imageUrl) {
        imageUrls = [imageUrl];
      } else if (files && files.length > 0) {
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', 'ml_default');
          const res = await fetch('https://api.cloudinary.com/v1_1/dcogakkza/upload', { method: 'POST', body: formData });
          const data = await res.json();
          imageUrls.push(data.secure_url);
        }
      }

      const { error } = await supabase
        .from('messages')
        .insert([{ 
          sender_id: user.id, 
          receiver_id: receiverId, 
          content,
          images: imageUrls,
          image_url: imageUrls[0] || null 
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (otherUserId) queryClient.invalidateQueries({ queryKey: ['chat', otherUserId] });
    }
  });

  const markAsRead = useMutation({
    mutationFn: async (senderId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('messages').update({ is_read: true }).eq('receiver_id', user.id).eq('sender_id', senderId).eq('is_read', false);
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] }); 
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  const deleteConversation = useMutation({
    mutationFn: async (otherId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Elimina fisicamente tutti i messaggi tra i due utenti dal database
      const { error } = await supabase
        .from('messages')
        .delete()
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`);
      
      if (error) throw error;
    },
    onSuccess: (_, otherId) => {
      // Pulisce la cache per far sparire la conversazione e i messaggi
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat', otherId] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
      showSuccess("Conversazione eliminata definitivamente");
    },
    onError: (err: any) => showError("Errore durante la pulizia del database")
  });

  const deleteMessage = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase.from('messages').delete().eq('id', messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (otherUserId) queryClient.invalidateQueries({ queryKey: ['chat', otherUserId] });
    }
  });

  return { conversations, unreadCount, loadingConvs, chatMessages, loadingChat, sendMessage, markAsRead, deleteConversation, deleteMessage };
};