import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";

/**
 * Funzione di fetch ultra-compatibile con gestione dinamica dei parametri e fallback
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
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.message || `Errore ${response.status}`;
      
      // Se è un 401 (Unauthorized), lo lanciamo chiaramente per l'UI
      if (response.status === 401) throw new Error("401");
      
      // Se è un 400 (Bad Request), proviamo a pulire i parametri
      if (response.status === 400) {
        console.warn(`[BuddyPress] Parametri non validi per ${endpoint}, provo fallback...`);
        throw new Error("400");
      }

      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (err: any) {
    throw err;
  }
};

export const useBpMembers = (perPage = 20) => {
  return useQuery({
    queryKey: ['bp-members', perPage],
    queryFn: async () => {
      try {
        // Tentativo 1: BuddyPress con filtro tipo (potrebbe dare 400)
        return await bpFetch(`/buddypress/v1/members?per_page=${perPage}&member_type=membroufficiale&context=embed`);
      } catch (e: any) {
        if (e.message === "401") throw e; // Se è 401, fermati e chiedi login
        
        try {
          // Tentativo 2: BuddyPress generale (senza filtro tipo)
          return await bpFetch(`/buddypress/v1/members?per_page=${perPage}&context=embed`);
        } catch (e2: any) {
          if (e2.message === "401") throw e2;
          
          // Tentativo 3: Fallback su API Utenti WordPress standard
          console.log("[BuddyPress] Fallback su API WordPress standard");
          return await bpFetch(`/wp/v2/users?per_page=${perPage}&_embed`);
        }
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};

export const useBpActivity = (userId?: number) => {
  return useInfiniteQuery({
    queryKey: ['bp-activity', userId],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const endpoint = `/buddypress/v1/activity?page=${pageParam}&per_page=10&context=embed${userId ? `&user_id=${userId}` : ''}`;
        const data = await bpFetch(endpoint);
        return Array.isArray(data) ? data : (data?.activities || []);
      } catch (e: any) {
        if (e.message === "401") throw e;
        return [];
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage && lastPage.length === 10 ? allPages.length + 1 : undefined;
    },
    enabled: true,
  });
};