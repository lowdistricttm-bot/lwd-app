import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";

/**
 * Funzione di fetch ottimizzata con Authorization Header standard
 */
const bpFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('ld_auth_token');
  
  // Costruiamo l'URL assicurandoci che non ci siano doppi slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = new URL(`${BASE_URL}${cleanEndpoint}`);

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  // Usiamo l'Header Authorization invece del parametro URL (più sicuro e compatibile)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url.toString(), {
      ...options,
      headers,
      mode: 'cors'
    });

    if (!response.ok) {
      // Se fallisce con 400/401, proviamo una richiesta pubblica pulita senza token
      if (response.status === 400 || response.status === 401) {
        const publicRes = await fetch(url.toString(), { 
          headers: { 'Accept': 'application/json' },
          mode: 'cors' 
        });
        if (publicRes.ok) return await publicRes.json();
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Errore ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error(`[BuddyPress Error] ${endpoint}:`, err.message);
    throw err;
  }
};

export const useBpActivity = (userId?: number) => {
  return useInfiniteQuery({
    queryKey: ['bp-activity', userId],
    queryFn: async ({ pageParam = 1 }) => {
      // Aggiungiamo context=view per compatibilità
      let endpoint = `/buddypress/v1/activity?page=${pageParam}&per_page=10&context=view`;
      if (userId) endpoint += `&user_id=${userId}`;
      
      const data = await bpFetch(endpoint);
      return Array.isArray(data) ? data : (data?.activities || []);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage && lastPage.length === 10 ? allPages.length + 1 : undefined;
    },
    staleTime: 1000 * 30,
  });
};

export const useBpMembers = (perPage = 20) => {
  return useQuery({
    queryKey: ['bp-members', perPage],
    queryFn: async () => {
      // context=view è spesso richiesto per le liste pubbliche
      return bpFetch(`/buddypress/v1/members?per_page=${perPage}&context=view`);
    },
    staleTime: 1000 * 60 * 10,
    retry: 1,
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

export const useFavoriteActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ activityId, isFavorite }: { activityId: number, isFavorite: boolean }) => {
      const method = isFavorite ? 'POST' : 'DELETE';
      return bpFetch(`/buddypress/v1/activity/${activityId}/favorite`, { method });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bp-activity'] })
  });
};

export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      return bpFetch('/buddypress/v1/activity', {
        method: 'POST',
        body: JSON.stringify({
          content: content,
          component: 'activity',
          type: 'activity_update'
        })
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bp-activity'] })
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, file }: { userId: number, file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      return bpFetch(`/buddypress/v1/members/${userId}/avatar`, {
        method: 'POST',
        body: formData,
        headers: {} // Rimuoviamo Content-Type per permettere al browser di impostare il boundary del FormData
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bp-member-data', variables.userId] });
    }
  });
};