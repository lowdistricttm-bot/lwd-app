"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const BP_API_URL = "https://www.lowdistrict.it/wp-json/buddypress/v1";

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
      const response = await fetch(`${BP_API_URL}/activity?per_page=20&_embed`);
      if (!response.ok) throw new Error('Errore nel caricamento della bacheca');
      return response.json() as Promise<BPActivity[]>;
    },
    refetchInterval: 30000, // Aggiorna ogni 30 secondi
  });
};

export const useBPMembers = () => {
  return useQuery({
    queryKey: ['bp-members'],
    queryFn: async () => {
      const response = await fetch(`${BP_API_URL}/members?per_page=10`);
      if (!response.ok) throw new Error('Errore nel caricamento dei membri');
      return response.json();
    },
  });
};