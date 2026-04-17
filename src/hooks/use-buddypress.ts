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

export const useBPSearchMembers = (search: string) => {
  return useQuery({
    queryKey: ['bp-members-search', search],
    queryFn: async () => {
      if (!search || search.length < 2) return [];
      const headers = await getAuthHeader();
      try {
        const response = await fetch(`${BP_API_URL}/members?search=${encodeURIComponent(search)}&per_page=20`, {
          headers: { 'Accept': 'application/json', ...headers }
        });
        if (!response.ok) return [];
        return response.json();
      } catch (err) {
        return [];
      }
    },
    enabled: !!search && search.length >= 2
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
      
      // Puliamo lo username per la ricerca
      const searchTerm = username.replace(/-/g, ' ').trim();
      if (!searchTerm) return null;
      
      try {
        const response = await fetch(`${BP_API_URL}/members?search=${encodeURIComponent(searchTerm)}`, {
          headers: { 'Accept': 'application/json', ...headers }
        });
        
        if (!response.ok) return null;
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          return data.find((m: any) => 
            m.user_login === username || 
            m.mention_name === username || 
            m.name === searchTerm
          ) || data[0];
        }
        return null;
      } catch (err) {
        console.error("[BuddyPress] Errore ricerca membro:", err);
        return null;
      }
    },
    enabled: !!username && username.length > 0,
    retry: false,
    staleTime: 1000 * 60 * 5 // Cache per 5 minuti
  });
};