import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";

/**
 * Funzione di fetch ottimizzata basata sulla logica funzionante del profilo.
 * Usa il parametro JWT nell'URL che è l'unico metodo accettato dal server lowdistrict.it
 */
const bpFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('ld_auth_token');
  
  // Costruiamo l'URL in modo pulito
  const url = new URL(`${BASE_URL}${endpoint}`);
  
  // Aggiungiamo il token solo se presente
  if (token) {
    url.searchParams.set('JWT', token);
  }

  try {
    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        ...options.headers,
        'Accept': 'application/json',
      },
      mode: 'cors'
    });

    if (!response.ok) {
      // Se fallisce con errore di autorizzazione, proviamo a caricare il contenuto pubblico (senza token)
      if (response.status === 401 || response.status === 400) {
        const publicUrl = new URL(`${BASE_URL}${endpoint}`);
        const publicRes = await fetch(publicUrl.toString(), { mode: 'cors' });
        if (publicRes.ok) return await publicRes.json();
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Errore ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error(`[BP API Error] ${endpoint}:`, err.message);
    throw err;
  }
};

export const useBpActivity = (userId?: number) => {
  return useInfiniteQuery({
    queryKey: ['bp-activity', userId],
    queryFn: async ({ pageParam = 1 }) => {
      // Riduciamo i parametri al minimo per evitare l'errore 400
      let endpoint = `/buddypress/v1/activity?page=${pageParam}&per_page=10`;
      if (userId) endpoint += `&user_id=${userId}`;
      
      const data = await bpFetch(endpoint);
      
      // Gestione flessibile del formato di risposta BuddyPress
      if (Array.isArray(data)) return data;
      if (data && data.activities) return data.activities;
      return [];
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage && lastPage.length === 10 ? allPages.length + 1 : undefined;
    },
    staleTime: 1000 * 20,
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

export const useBpMembers = (perPage = 10) => {
  return useQuery({
    queryKey: ['bp-members', perPage],
    queryFn: async () => {
      // Usiamo un perPage più basso (10) per evitare timeout o errori 400
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