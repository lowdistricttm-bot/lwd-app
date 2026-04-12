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

      // Proviamo a inviare la richiesta con i parametri corretti per BuddyPress
      const response = await fetch(`${BASE_URL}/buddypress/v1/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest' // Alcuni server WP lo richiedono per evitare blocchi
        },
        body: JSON.stringify({
          content: content,
          component: 'activity',
          type: 'activity_update',
          status: 'published'
        })
      });

      if (!response.ok) {
        let errorMessage = "Errore durante la pubblicazione";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error("Dettagli errore API:", errorData);
        } catch (e) {
          console.error("Errore risposta non JSON:", response.status);
        }
        throw new Error(errorMessage);
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