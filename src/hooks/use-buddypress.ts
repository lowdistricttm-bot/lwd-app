"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showError, showSuccess } from '@/utils/toast';

const BP_API_URL = "https://www.lowdistrict.it/wp-json/buddypress/v1";
const WP_API_URL = "https://www.lowdistrict.it/wp-json/wp/v2";

const getAuthHeader = async () => {
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
  content: { rendered: string };
  date: string;
  user_avatar?: { full: string; thumb: string };
  user_name?: string;
}

export const useBPActivity = () => {
  return useQuery({
    queryKey: ['bp-activity'],
    queryFn: async () => {
      const headers = await getAuthHeader();
      const response = await fetch(`${BP_API_URL}/activity?per_page=20&context=view`, {
        headers: { 'Accept': 'application/json', ...headers }
      });
      if (!response.ok) throw new Error('Errore caricamento bacheca');
      return response.json() as Promise<BPActivity[]>;
    },
    refetchInterval: 60000,
  });
};

// Ricerca membri ottimizzata per BuddyPress
export const useBPSearchMembers = (search: string) => {
  return useQuery({
    queryKey: ['bp-members-search', search],
    queryFn: async () => {
      if (search.length < 2) return [];
      
      const headers = await getAuthHeader();
      console.log(`[BuddyPress] Ricerca in corso per: ${search}...`);
      
      try {
        // Aggiungiamo type=active e context=view per massimizzare la compatibilità
        const response = await fetch(
          `${BP_API_URL}/members?search=${encodeURIComponent(search)}&per_page=20&type=active&context=view`, 
          { headers: { 'Accept': 'application/json', ...headers } }
        );

        if (!response.ok) {
          console.error(`[BuddyPress] Errore API: ${response.status}`);
          return [];
        }

        const data = await response.json();
        console.log(`[BuddyPress] Risultati trovati:`, data.length);
        
        // BuddyPress a volte restituisce un oggetto errore invece di un array vuoto
        if (!Array.isArray(data)) return [];
        
        return data;
      } catch (error) {
        console.error("[BuddyPress] Errore durante la fetch:", error);
        return [];
      }
    },
    enabled: search.length >= 2,
    staleTime: 30000 // Cache di 30 secondi per non sovraccaricare il server
  });
};

export const useBPActions = () => {
  const queryClient = useQueryClient();

  const favoriteMutation = useMutation({
    mutationFn: async (activityId: number) => {
      const headers = await getAuthHeader();
      const response = await fetch(`${BP_API_URL}/activity/${activityId}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers }
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
      const headers = await getAuthHeader();
      const response = await fetch(`${BP_API_URL}/activity/${activityId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
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

export const useBPMember = (username?: string) => {
  return useQuery({
    queryKey: ['bp-member', username],
    queryFn: async () => {
      if (!username) return null;
      const headers = await getAuthHeader();
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