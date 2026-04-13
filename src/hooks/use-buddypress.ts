"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showError, showSuccess } from '@/utils/toast';

const BP_API_URL = "https://www.lowdistrict.it/wp-json/buddypress/v1";
const WP_API_URL = "https://www.lowdistrict.it/wp-json/wp/v2";

const getAuthHeader = () => {
  const token = localStorage.getItem('wp-jwt');
  if (!token) return {};
  return { 'Authorization': `Bearer ${token}` };
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
  const token = localStorage.getItem('wp-jwt');
  
  return useQuery({
    // Includiamo il token nella queryKey così se cambia (login/logout) la query si resetta
    queryKey: ['bp-activity', token],
    queryFn: async () => {
      const response = await fetch(`${BP_API_URL}/activity?per_page=20&_embed`, {
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader() 
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Impossibile caricare la bacheca.');
      }
      return response.json() as Promise<BPActivity[]>;
    },
    refetchInterval: 60000,
  });
};

export const useBPActions = () => {
  const queryClient = useQueryClient();

  const favoriteMutation = useMutation({
    mutationFn: async (activityId: number) => {
      const headers = getAuthHeader();
      if (!headers.Authorization) throw new Error('Sessione WordPress mancante. Effettua il login.');

      const response = await fetch(`${BP_API_URL}/activity/${activityId}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Errore Like.');
      }
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
      const headers = getAuthHeader();
      if (!headers.Authorization) throw new Error('Sessione WordPress mancante. Effettua il login.');

      const response = await fetch(`${BP_API_URL}/activity/${activityId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Errore commento.');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bp-activity'] });
      showSuccess("Commento inviato!");
    },
    onError: (error: any) => showError(error.message)
  });

  const createPostMutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const headers = getAuthHeader();
      if (!headers.Authorization) throw new Error('Sessione WordPress mancante. Effettua il login.');

      if (!content.trim()) throw new Error('Il contenuto del post non può essere vuoto.');

      const response = await fetch(`${BP_API_URL}/activity`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          ...headers 
        },
        body: JSON.stringify({
          content: content,
          component: 'activity',
          type: 'activity_update'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Errore server (${response.status}). Riprova tra poco.`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bp-activity'] });
      showSuccess("Post pubblicato nel District!");
    },
    onError: (error: any) => {
      console.error("[Bacheca] Errore pubblicazione:", error);
      showError(error.message);
    }
  });

  const uploadMediaMutation = useMutation({
    mutationFn: async (file: File) => {
      const headers = getAuthHeader();
      if (!headers.Authorization) throw new Error('Sessione WordPress mancante.');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${WP_API_URL}/media`, {
        method: 'POST',
        headers: { ...headers },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Errore caricamento file.');
      }
      return response.json();
    }
  });

  return { favoriteMutation, commentMutation, createPostMutation, uploadMediaMutation };
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