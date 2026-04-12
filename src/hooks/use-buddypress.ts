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
    mutationFn: async ({ content, userId }: { content: string, userId: number }) => {
      const token = localStorage.getItem('ld_auth_token');
      if (!token) throw new Error("Devi essere loggato per pubblicare");

      // Endpoint standard BuddyPress per l'attività
      const url = `${BASE_URL}/buddypress/v1/activity`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Usiamo il formato Bearer standard
        },
        body: JSON.stringify({
          content: content,
          user_id: userId,
          component: 'activity',
          type: 'activity_update'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Se fallisce con Bearer, proviamo il fallback con parametro URL (alcuni plugin WP lo preferiscono)
        if (response.status === 401 || response.status === 400) {
           const fallbackUrl = `${url}?JWT=${token}`;
           const fallbackResponse = await fetch(fallbackUrl, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               content: content,
               user_id: userId,
               component: 'activity',
               type: 'activity_update'
             })
           });
           
           if (fallbackResponse.ok) return fallbackResponse.json();
        }
        throw new Error(errorData.message || `Errore ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Reset della cache per mostrare il nuovo post
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