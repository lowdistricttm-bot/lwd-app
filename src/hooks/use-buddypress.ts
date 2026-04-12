import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";

export const useBpActivity = () => {
  return useInfiniteQuery({
    queryKey: ['bp-activity'],
    queryFn: async ({ pageParam = 1 }) => {
      const url = `${BASE_URL}/lowdistrict/v1/activity?page=${pageParam}&per_page=20`;
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors',
        });

        if (!response.ok) {
          throw new Error(`Errore server: ${response.status}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (err: any) {
        console.error("Errore caricamento bacheca:", err);
        throw err;
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    staleTime: 1000 * 30,
  });
};

export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const token = localStorage.getItem('ld_auth_token');
      if (!token) throw new Error("Devi essere loggato per pubblicare");

      const response = await fetch(`${BASE_URL}/buddypress/v1/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: content,
          component: 'activity',
          type: 'activity_update'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Se il server dice che non siamo autorizzati, potrebbe essere il token scaduto
        if (response.status === 401 || response.status === 403) {
          throw new Error("Sessione scaduta o permessi insufficienti. Prova a rifare il login.");
        }
        throw new Error(errorData.message || "Errore del server");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bp-activity'] });
    }
  });
};

export const useBpMembers = (perPage = 100) => {
  return useQuery({
    queryKey: ['bp-members', perPage],
    queryFn: async () => {
      const token = localStorage.getItem('ld_auth_token');
      const url = `${BASE_URL}/buddypress/v1/members?per_page=${perPage}&type=active&JWT=${token}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Errore caricamento membri");
      return await response.json();
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const getCachedMembers = () => {
  const cached = localStorage.getItem('ld_members_directory');
  return cached ? JSON.parse(cached) : null;
};