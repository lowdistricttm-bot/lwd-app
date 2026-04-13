"use client";

import { useQuery } from '@tanstack/react-query';

const BP_API_URL = "https://www.lowdistrict.it/wp-json/buddypress/v1";

// NOTA: Se il tuo sito richiede autenticazione, genera una "Application Password" su WP
// e inseriscila qui nel formato "username:password" codificato in base64.
// Per ora la lasciamo vuota per tentare l'accesso pubblico.
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
    refetchInterval: 60000, // Aggiorna ogni minuto
    retry: 1,
  });
};