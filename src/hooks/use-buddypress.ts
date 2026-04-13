"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showError, showSuccess } from '@/utils/toast';

const BP_API_URL = "https://www.lowdistrict.it/wp-json/buddypress/v1";
const WP_API_URL = "https://www.lowdistrict.it/wp-json/wp/v2";

// Funzione per ottenere il token JWT direttamente da WordPress
const getWpJwt = async () => {
  const username = localStorage.getItem('wp-username');
  const password = localStorage.getItem('wp-password');
  
  if (!username || !password) {
    console.warn("[BP] Credenziali WordPress non trovate");
    return null;
  }

  try {
    const response = await fetch("https://www.lowdistrict.it/wp-json/simple-jwt-login/v1/auth", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      console.error("[BP] Errore login WordPress:", await response.json());
      return null;
    }

    const data = await response.json();
    const jwt = data.jwt || (data.data && data.data.jwt);
    
    if (jwt) {
      console.log("[BP] Token JWT ottenuto con successo");
      return jwt;
    }

    console.warn("[BP] Nessun token JWT trovato nella risposta");
    return null;
  } catch (error) {
    console.error("[BP] Errore durante il login:", error);
    return null;
  }
};

const getAuthHeader = async () => {
  const token = localStorage.getItem('wp-jwt');
  
  // Se non abbiamo un token salvato, proviamo a ottenerlo
  if (!token) {
    const newToken = await getWpJwt();
    if (newToken) {
      localStorage.setItem('wp-jwt', newToken);
      return { 'Authorization': `Bearer ${newToken}` };
    }
    return {};
  }

  try {
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
      const headers = await getAuthHeader();
      
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
      const headers = await getAuthHeader();
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
      const headers = await getAuthHeader();
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
      const headers = await getAuthHeader();
      if (!headers.Authorization) throw new Error('Accedi per pubblicare');

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
      showError(error.message)
    }
  });

  const uploadMediaMutation = useMutation({
    mutationFn: async (file: File) => {
      const headers = await getAuthHeader();
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
      const headers = await getAuthHeader();
      
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