import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";

/**
 * Funzione di fetch ultra-robusta per BuddyPress
 * Gestisce i problemi di CORS e Autenticazione JWT
 */
const bpFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('ld_auth_token');
  const url = new URL(`${BASE_URL}${endpoint}`);
  
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');

  // Se abbiamo un token, lo passiamo sia nell'Header che come parametro di sicurezza
  // Questo massimizza la compatibilità con diverse configurazioni di server/firewall
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
    url.searchParams.set('JWT', token);
  }

  try {
    const response = await fetch(url.toString(), {
      ...options,
      headers,
      mode: 'cors',
      cache: 'no-cache' // Evita di ricevere risposte 401/400 memorizzate
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Errore ${response.status}` }));
      console.error(`[BuddyPress API Error ${response.status}]`, errorData);
      throw new Error(errorData.message || `Errore server ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    // Se fallisce con il token (magari è scaduto), proviamo una volta senza token per i contenuti pubblici
    if (token && !options.method || options.method === 'GET') {
      url.searchParams.delete('JWT');
      const publicRes = await fetch(url.toString(), { mode: 'cors' });
      if (publicRes.ok) return await publicRes.json();
    }
    throw err;
  }
};

export const useBpActivity = (userId?: number) => {
  return useInfiniteQuery({
    queryKey: ['bp-activity', userId],
    queryFn: async ({ pageParam = 1 }) => {
      let endpoint = `/buddypress/v1/activity?page=${pageParam}&per_page=10&display_comments=threaded`;
      if (userId) endpoint += `&user_id=${userId}`;
      
      try {
        const data = await bpFetch(endpoint);
        // BuddyPress può restituire l'array direttamente o dentro un oggetto
        if (Array.isArray(data)) return data;
        if (data && data.activities && Array.isArray(data.activities)) return data.activities;
        return [];
      } catch (err: any) {
        console.error("Errore critico bacheca:", err.message);
        throw err;
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length + 1 : undefined;
    },
    staleTime: 1000 * 15, // Aggiorna più spesso per sincronizzazione real-time
  });
};

export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      return bpFetch('/buddypress/v1/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content,
          component: 'activity',
          type: 'activity_update'
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bp-activity'] });
    }
  });
};

export const useBpMemberData = (userId: number | undefined) => {
  return useQuery({
    queryKey: ['bp-member-data', userId],
    queryFn: async () => {
      if (!userId) return null;
      return bpFetch(`/buddypress/v1/members/${userId}?context=view`);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useBpMembers = (perPage = 100) => {
  return useQuery({
    queryKey: ['bp-members', perPage],
    queryFn: async () => {
      return bpFetch(`/buddypress/v1/members?per_page=${perPage}&type=active`);
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, file }: { userId: number, file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', 'bp_avatar_upload');

      return bpFetch(`/buddypress/v1/members/${userId}/avatar`, {
        method: 'POST',
        body: formData
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bp-member-data', variables.userId] });
    }
  });
};