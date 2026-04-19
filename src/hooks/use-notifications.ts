"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from 'react';
import { playNotificationSound } from '@/utils/sound';

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: 'like' | 'comment' | 'vehicle_like' | 'application_status' | 'event_update' | 'event_new' | 'event_open' | 'event_closed' | 'follow' | 'admin_announcement';
  post_id?: string;
  application_id?: string;
  event_id?: string;
  vehicle_id?: string;
  is_read: boolean;
  created_at: string;
  content?: string;
  actor?: {
    username: string;
    avatar_url: string;
  };
  posts?: {
    content: string;
  };
  applications?: {
    status: string;
    events: { title: string };
  };
  event?: {
    title: string;
  };
  vehicles?: {
    brand: string;
    model: string;
  };
}

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:actor_id (username, avatar_url),
          posts:post_id (content),
          applications:application_id (status, events:event_id (title)),
          event:event_id (title),
          vehicles:vehicle_id (brand, model)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) {
        console.error("[Notifications] Errore query:", error);
        return [];
      }
      return data as Notification[];
    },
    staleTime: 0 // Assicura refresh immediato su invalidazione
  });

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  useEffect(() => {
    let channel: any;

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const instanceId = Math.random().toString(36).substring(2, 9);
      
      channel = supabase
        .channel(`notifications-realtime-${user.id}-${instanceId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            playNotificationSound();
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      await supabase.from('notifications').delete().eq('id', notificationId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  return { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification, error };
};