"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from 'react';
import { playNotificationSound } from '@/utils/sound';

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: 'like' | 'comment' | 'application_status';
  post_id?: string;
  application_id?: string;
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
}

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
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
          applications:application_id (status, events:event_id (title))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as Notification[];
    }
  });

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  useEffect(() => {
    let channel: any;

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Usiamo un ID univoco per evitare l'errore di aggiunta callback dopo subscribe
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

  return { notifications, unreadCount, isLoading, markAllAsRead };
};