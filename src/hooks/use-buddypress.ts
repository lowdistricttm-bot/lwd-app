import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";

/**
 * Funzione di fetch ultra-compatibile
 */
const bpFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('ld_auth_token');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
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
      // Fallback estremo: riprova senza alcun parametro o header se fallisce
      if (response.status === 400) {
        const simpleUrl = new URL(`${BASE_URL}${cleanEndpoint.split('?')[0]}`);
        const simpleRes = await fetch(simpleUrl.toString(), { mode: 'cors' });
        if (simpleRes.ok) return await simpleRes.json();
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
      // Usiamo context=embed che è più leggero e spesso più accessibile
      let endpoint = `/buddypress/v1/activity?page=${pageParam}&per_page=10&context=embed`;
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
      // Riduciamo per_page e usiamo context=embed
      return bpFetch(`/buddypress/v1/members?per_page=${perPage}&context=embed`);
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

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, file }: { userId: number, file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
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