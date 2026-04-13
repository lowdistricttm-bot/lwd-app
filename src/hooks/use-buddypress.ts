import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";

const bpFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('ld_auth_token');
  // Rimuoviamo eventuali slash doppi e costruiamo l'URL pulito
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    mode: 'cors'
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error("401");
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Errore ${response.status}`);
  }

  return await response.json();
};

// --- MEMBRI ---
export const useBpMembers = (perPage = 20) => {
  return useQuery({
    queryKey: ['bp-members', perPage],
    queryFn: () => bpFetch(`/buddypress/v1/members?per_page=${perPage}`),
    staleTime: 1000 * 60 * 5,
  });
};

// --- BACHECA (ACTIVITY) ---
export const useBpActivity = (userId?: number) => {
  return useInfiniteQuery({
    queryKey: ['bp-activity', userId],
    queryFn: async ({ pageParam = 1 }) => {
      let endpoint = `/buddypress/v1/activity?page=${pageParam}&per_page=10`;
      if (userId) endpoint += `&user_id=${userId}`;
      
      const data = await bpFetch(endpoint);
      return Array.isArray(data) ? data : [];
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage && lastPage.length === 10 ? allPages.length + 1 : undefined;
    },
  });
};

// --- AZIONI ACTIVITY ---
export const useActivityActions = () => {
  const queryClient = useQueryClient();

  const postActivity = useMutation({
    mutationFn: (content: string) => bpFetch('/buddypress/v1/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, component: 'activity', type: 'activity_update' })
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bp-activity'] })
  });

  const favoriteActivity = useMutation({
    mutationFn: (id: number) => bpFetch(`/buddypress/v1/activity/${id}/favorite`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bp-activity'] })
  });

  return { postActivity, favoriteActivity };
};

// --- PROFILO (XPROFILE) ---
export const useBpProfile = (userId: number | undefined) => {
  return useQuery({
    queryKey: ['bp-profile', userId],
    queryFn: () => bpFetch(`/buddypress/v1/members/${userId}/xprofile`),
    enabled: !!userId,
  });
};