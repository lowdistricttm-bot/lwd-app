"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showError, showSuccess } from '@/utils/toast';

const BP_API_URL = "https://www.lowdistrict.it/wp-json/buddypress/v1";

const getAuthHeader = () => {
  const token = localStorage.getItem('wp-jwt');
  const headers: Record<string, string> = {
    'Accept': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export interface BPActivity {
  id: number;
  user_id: number;
  component: string;
  type: string;
  action: string;
  content: { rendered: string };
  date: string;
  user_avatar?: { full: string; thumb: string };
  user_name?: string;
}

export const useBPActivity = () => {
  return useQuery({
    queryKey: ['bp-activity'],
    queryFn: async () => {
      try {
        const response = await fetch(`${BP_API_URL}/activity?per_page=20`, {
          headers: getAuthHeader()
        });
        if (response.status === 401) return [];
        if (!response.ok) throw new Error('Errore caricamento bacheca');
        return response.json() as Promise<BPActivity[]>;
      } catch (err) {
        return [];
      }
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
        headers: { 
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Errore Like');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bp-activity'] });
      showSuccess("District Like!");
    }
  });

  const commentMutation = useMutation({
    mutationFn: async ({ activityId, content }: { activityId: number, content: string }) => {
      const response = await fetch(`${BP_API_URL}/activity/${activityId}/comment`, {
        method: 'POST',
        headers: { 
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });
      if (!response.ok) throw new Error('Errore invio commento');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bp-activity'] });
      showSuccess("Commento inviato!");
    }
  });

  return { favoriteMutation, commentMutation };
};

export const useBPMember = (identifier?: string, type: 'username' | 'id' = 'username') => {
  return useQuery({
    queryKey: ['bp-member', identifier, type],
    queryFn: async () => {
      if (!identifier) return null;
      
      try {
        // Se abbiamo l'ID, usiamo l'endpoint diretto che è infallibile
        if (type === 'id') {
          const response = await fetch(`${BP_API_URL}/members/${identifier}`, {
            headers: getAuthHeader()
          });
          if (response.ok) return response.json();
        }

        // Altrimenti cerchiamo per username
        const searchTerm = identifier.replace(/-/g, ' ').trim();
        const url = `${BP_API_URL}/members?search=${encodeURIComponent(searchTerm)}`;
        const response = await fetch(url, {
          headers: getAuthHeader()
        });
        
        if (!response.ok) return null;
        
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.find((m: any) => 
            m.user_login === identifier || 
            m.mention_name === identifier
          ) || data[0];
        }
        return null;
      } catch (err) {
        return null;
      }
    },
    enabled: !!identifier && identifier.length > 0,
    retry: false,
    staleTime: 1000 * 60 * 5
  });
};