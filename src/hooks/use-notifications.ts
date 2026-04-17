"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from 'react';
import { playNotificationSound } from '@/utils/sound';
import { showSuccess, showError } from '@/utils/toast';

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: 'like' | 'comment' | 'application_status' | 'event_update' | 'event_new' | 'event_open' | 'event_closed';
  post_id?: string;
  application_id?: string;
  event_id?: string;
  is_read: boolean;
  created_at: string;
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
}

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      try {
        const { data, error } = await supabase
          .from('notifications')
          .select(`
            *,
            actor:actor_id (username, avatar_url),
            posts:post_id (content),
            applications:application_id (status, events:event_id (title)),
            event:event_id (title)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          if (error.code === '42P01' || error.message?.includes('not found')) {
            console.warn("[Notifications] Tabella non trovata.");
            return [];
          }
          throw error;
        }
        return data as Notification[];
      } catch (err) {
        console.error("[Notifications] Errore query:", err);
        return [];
      }
    }
  });

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  useEffect(() => {
    let channel: any;

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channelId = `notifications-${user.id}-${Math.random().toString(36).substring(2, 9)}`;

      channel = supabase
        .channel(channelId)
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
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [queryClient]);

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showSuccess("Notifica rimossa");
    },
    onError: (err: any) => showError(err.message)
  });

  return { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification, error };
};