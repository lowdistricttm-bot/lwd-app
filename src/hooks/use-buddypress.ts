import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";

/**
 * Funzione di fetch ultra-resiliente.
 * Tenta l'autenticazione in più modi per superare i limiti del server.
 */
const bpFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('ld_auth_token');
  
  // 1. TENTATIVO CON HEADER (Metodo preferito, URL corto)
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, { 
      ...options, 
      headers, 
      mode: 'cors' 
    });
    
    if (response.ok) return await response.json();
    
    // 2. TENTATIVO CON PARAMETRO URL (Se l'header è bloccato)
    if (token && (response.status === 401 || response.status === 400)) {
      const url = new URL(`${BASE_URL}${endpoint}`);
      url.searchParams.set('JWT', token);
      const retryRes = await fetch(url.toString(), { ...options, mode: 'cors' });
      if (retryRes.ok) return await retryRes.json();
    }
    
    // 3. TENTATIVO PUBBLICO (Se l'autenticazione fallisce)
    if (response.status === 401 || response.status === 400) {
      const publicRes = await fetch(`${BASE_URL}${endpoint}`, { mode: 'cors' });
      if (publicRes.ok) return await publicRes.json();
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Errore ${response.status}`);
  } catch (err: any) {
    console.error(`[BP API Error] ${endpoint}:`, err.message);
    throw err;
  }
};

export const useBpActivity = (userId?: number) => {
  return useInfiniteQuery({
    queryKey: ['bp-activity', userId],
    queryFn: async ({ pageParam = 1 }) => {
      // Parametri ridotti all'osso per evitare l'errore 400
      let endpoint = `/buddypress/v1/activity?page=${pageParam}&per_page=10`;
      if (userId) endpoint += `&user_id=${userId}`;
      
      const data = await bpFetch(endpoint);
      if (Array.isArray(data)) return data;
      if (data && data.activities) return data.activities;
      return [];
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage && lastPage.length === 10 ? allPages.length + 1 : undefined;
    },
    staleTime: 1000 * 30,
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
      // Rimosso 'type=active' che spesso causa 400 su alcuni server
      return bpFetch(`/buddypress/v1/members?per_page=${perPage}`);
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