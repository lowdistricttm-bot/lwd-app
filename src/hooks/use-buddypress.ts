import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";

// Funzione helper per gestire le chiamate autenticate
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('ld_auth_token');
  const headers = {
    ...options.headers,
    'Accept': 'application/json',
  } as Record<string, string>;

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers, mode: 'cors' });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Errore ${response.status}`);
  }
  
  return response.json();
};

export const useBpActivity = (userId?: number) => {
  return useInfiniteQuery({
    queryKey: ['bp-activity', userId],
    queryFn: async ({ pageParam = 1 }) => {
      let url = `${BASE_URL}/buddypress/v1/activity?page=${pageParam}&per_page=10&display_comments=threaded`;
      if (userId) url += `&user_id=${userId}`;
      
      try {
        const data = await authenticatedFetch(url);
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object' && Array.isArray(data.activities)) return data.activities;
        return [];
      } catch (err: any) {
        console.error("Errore caricamento bacheca:", err);
        throw err;
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length + 1 : undefined;
    },
    staleTime: 1000 * 30,
  });
};

export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      return authenticatedFetch(`${BASE_URL}/buddypress/v1/activity`, {
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
      return authenticatedFetch(`${BASE_URL}/buddypress/v1/members/${userId}?context=view`);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useBpMembers = (perPage = 100) => {
  return useQuery({
    queryKey: ['bp-members', perPage],
    queryFn: async () => {
      return authenticatedFetch(`${BASE_URL}/buddypress/v1/members?per_page=${perPage}&type=active`);
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, file }: { userId: number, file: File }) => {
      const token = localStorage.getItem('ld_auth_token');
      if (!token) throw new Error("Sessione scaduta");

      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', 'bp_avatar_upload');

      const response = await fetch(`${BASE_URL}/buddypress/v1/members/${userId}/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        mode: 'cors'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Errore caricamento" }));
        throw new Error(errorData.message || `Errore ${response.status}`);
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bp-member-data', variables.userId] });
    }
  });
};