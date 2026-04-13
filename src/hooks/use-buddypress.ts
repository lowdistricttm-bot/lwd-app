"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showError, showSuccess } from '@/utils/toast';

const BP_API_URL = "https://www.lowdistrict.it/wp-json/buddypress/v1";

const getAuthHeader = () => {
  const token = localStorage.getItem('wp-jwt');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export interface BPActivity {
  id: number;
  user_id: number;
  component: string;
  type: string;
  action: string;
  content: {
    rendered: string;
  };
  date: string;
  user_avatar?: {
    full: string;
    thumb: string;
  };
  user_name?: string;
  favorite_count?: number;
  comment_count?: number;
}

export const useBPActivity = () => {
  return useQuery({
    queryKey: ['bp-activity'],
    queryFn: async () => {
      const response = await fetch(`${BP_API_URL}/activity?per_page=20&_embed`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });

      if (!response.ok) throw new Error('Impossibile caricare la bacheca.');
      return response.json() as Promise<BPActivity[]>;
    },
    refetchInterval: 60000,
  });
};

export const useBPActions = () => {
  const queryClient = useQueryClient();

  const favoriteMutation = useMutation({
    mutationFn: async (activityId: number) => {
      const response = await fetch(`${BP_API_URL}/activity/${activityId}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      if (!response.ok) throw new Error('Devi essere loggato per mettere Like');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bp-activity'] });
      showSuccess("Aggiunto ai preferiti!");
    },
    onError: (error: any) => showError(error.message)
  });

  const commentMutation = useMutation({
    mutationFn: async ({ activityId, content }: { activityId: number, content: string }) => {
      const response = await fetch(`${BP_API_URL}/activity/${activityId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ content })
      });
      if (!response.ok) throw new Error('Errore durante l\'invio del commento');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bp-activity'] });
      showSuccess("Commento inviato!");
    },
    onError: (error: any) => showError(error.message)
  });

  return { favoriteMutation, commentMutation };
};

export const useBPMember = (username?: string) => {
  return useQuery({
    queryKey: ['bp-member', username],
    queryFn: async () => {
      if (!username) return null;
      const response = await fetch(`${BP_API_URL}/members?slug=${username}`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
      });
      if (!response.ok) throw new Error('Membro non trovato');
      const data = await response.json();
      return data[0];
    },
    enabled: !!username
  });
};