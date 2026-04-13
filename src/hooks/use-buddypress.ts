"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showError, showSuccess } from '@/utils/toast';

const BP_API_URL = "https://www.lowdistrict.it/wp-json/buddypress/v1";
const WP_API_URL = "https://www.lowdistrict.it/wp-json/wp/v2";

const getAuthHeader = () => {
  const token = localStorage.getItem('wp-jwt');
  
  // Verifica che il token sia una stringa valida e non vuota
  if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
    console.warn("[BP] Token JWT non valido o mancante");
    return {};
  }

  try {
    // Verifichiamo che il token sia un JWT valido
    const decoded = JSON.parse(atob(token.split('.')[1]));
    console.log("[BP] Token JWT valido per utente:", decoded.sub || decoded.user_id || decoded.email);
    
    return { 'Authorization': `Bearer ${token}` };
  } catch (error) {
    console.error("[BP] Token JWT non valido:", error);
    return {};
  }
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
      const headers = getAuthHeader();
      
      // Se non abbiamo un token valido, restituiamo un array vuoto
      if (!headers.Authorization) {
        console.warn("[BP] Nessun token JWT valido, impossibile caricare attività");
        return [];
      }

      const response = await fetch(`${BP_API_URL}/activity?per_page=20&context=view`, {
        headers: { 
          'Accept': 'application/json',
          ...headers 
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[BP] Errore caricamento attività:", errorData);
        throw new Error(errorData.message || 'Errore caricamento bacheca');
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
      if (!headers.Authorization) throw new Error('Accedi per mettere Like');

      const response = await fetch(`${BP_API_URL}/activity/${activityId}/favorite`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...headers 
        }
      });

      if (!response.ok) throw new Error('Errore Like');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bp-activity'] });
      showSuccess("District Like!");
    },
    onError: (error: any) => showError(error.message)
  });

  const commentMutation = useMutation({
    mutationFn: async ({ activityId, content }: { activityId: number, content: string }) => {
      const headers = getAuthHeader();
      if (!headers.Authorization) throw new Error('Accedi per commentare');

      const response = await fetch(`${BP_API_URL}/activity/${activityId}/comment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...headers 
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) throw new Error('Errore invio commento');
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
      if (!headers.Authorization) throw new Error('Accedi per pubblicare');

      // Formato corretto per BuddyPress activity
      const payload = {
        content: content,
        component: 'activity',
        type: 'activity_update',
        action: 'ha pubblicato un post'
      };

      console.log("[BP] Invio payload:", payload);
      console.log("[BP] Header di autorizzazione:", headers.Authorization);

      const response = await fetch(`${BP_API_URL}/activity`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...headers 
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[BP] Errore risposta:", errorData);
        throw new Error(errorData.message || 'Errore pubblicazione');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bp-activity'] });
      showSuccess("Post pubblicato nel District!");
    },
    onError: (error: any) => {
      console.error("[BP] Errore pubblicazione:", error);
      showError(error.message);
    }
  });

  const uploadMediaMutation = useMutation({
    mutationFn: async (file: File) => {
      const headers = getAuthHeader();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${WP_API_URL}/media`, {
        method: 'POST',
        headers: { ...headers },
        body: formData
      });

      if (!response.ok) throw new Error('Errore caricamento media');
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
      const headers = getAuthHeader();
      
      if (!headers.Authorization) {
        console.warn("[BP] Nessun token JWT valido, impossibile cercare membro");
        return null;
      }

      const response = await fetch(`${BP_API_URL}/members?search=${username}`, {
        headers: { 'Accept': 'application/json', ...headers }
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data[0];
    },
    enabled: !!username
  });
};