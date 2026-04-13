"use client";

import { useQuery } from '@tanstack/react-query';

const BP_API_URL = "https://www.lowdistrict.it/wp-json/buddypress/v1";

// NOTA: Se il tuo sito richiede autenticazione, genera una "Application Password" su WP
const AUTH_HEADER = ""; 

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
}

export interface BPMember {
  id: number;
  name: string;
  user_login: string;
  registered_since: string;
  avatar_urls: {
    full: string;
    thumb: string;
  };
}

export const useBPActivity = () => {
  return useQuery({
    queryKey: ['bp-activity'],
    queryFn: async () => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (AUTH_HEADER) {
        headers['Authorization'] = `Basic ${AUTH_HEADER}`;
      }

      const response = await fetch(`${BP_API_URL}/activity?per_page=20&_embed`, {
        headers
      });

      if (response.status === 401) {
        throw new Error('401: Accesso negato. L\'API di BuddyPress richiede autenticazione.');
      }

      if (!response.ok) {
        throw new Error(`Errore ${response.status}: Impossibile caricare la bacheca.`);
      }

      return response.json() as Promise<BPActivity[]>;
    },
    refetchInterval: 60000,
    retry: 1,
  });
};

export const useBPMember = (username?: string) => {
  return useQuery({
    queryKey: ['bp-member', username],
    queryFn: async () => {
      if (!username) return null;
      
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (AUTH_HEADER) headers['Authorization'] = `Basic ${AUTH_HEADER}`;

      // Cerchiamo il membro tramite lo slug (username)
      const response = await fetch(`${BP_API_URL}/members?slug=${username}`, { headers });
      if (!response.ok) throw new Error('Membro non trovato');
      
      const data = await response.json();
      return data[0] as BPMember;
    },
    enabled: !!username
  });
};