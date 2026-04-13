import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";

/**
 * Funzione di fetch ultra-compatibile con gestione dinamica dei parametri
 */
const bpFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('ld_auth_token');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Costruiamo l'URL
  const url = new URL(`${BASE_URL}${cleanEndpoint}`);

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

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
      // Se fallisce con 400, proviamo a rimuovere i parametri extra uno ad uno
      if (response.status === 400 && url.search.includes('member_type')) {
        const fallbackUrl = new URL(url.toString());
        fallbackUrl.searchParams.delete('member_type');
        const fallbackRes = await fetch(fallbackUrl.toString(), { mode: 'cors' });
        if (fallbackRes.ok) return await fallbackRes.json();
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
      const endpoint = `/buddypress/v1/activity?page=${pageParam}&per_page=10&context=embed`;
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
      // Aggiungiamo il filtro specifico per il tipo di membro trovato nel link
      return bpFetch(`/buddypress/v1/members?per_page=${perPage}&member_type=membroufficiale&context=embed`);
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
      return bpFetch(`/buddypress/v1/members/${userId}?context=embed`);
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
        headers: { 'Content-Type': 'application/json' },
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