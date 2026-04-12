import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";
// Usiamo un proxy pubblico per evitare i blocchi CORS del server WordPress in lettura
const PROXY_URL = "https://api.allorigins.win/raw?url=";

export const useBpActivity = (userId?: number) => {
  return useInfiniteQuery({
    queryKey: ['bp-activity', userId],
    queryFn: async ({ pageParam = 1 }) => {
      let wpUrl = `${BASE_URL}/buddypress/v1/activity?page=${pageParam}&per_page=10&display_comments=threaded`;
      if (userId) wpUrl += `&user_id=${userId}`;
      
      // Codifichiamo l'URL per il proxy
      const url = `${PROXY_URL}${encodeURIComponent(wpUrl)}`;
      
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Errore server: ${response.status}`);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (err: any) {
        console.error("Errore caricamento bacheca via proxy:", err);
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
      const token = localStorage.getItem('ld_auth_token');
      if (!token) throw new Error("Devi essere loggato per pubblicare");

      // Per la scrittura (POST) dobbiamo andare diretti al server. 
      // È fondamentale che il server WordPress abbia il plugin JWT e il fix CORS attivo.
      const url = `${BASE_URL}/buddypress/v1/activity?JWT=${token}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content,
          component: 'activity',
          type: 'activity_update'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Errore ${response.status}`);
      }

      return response.json();
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
      const wpUrl = `${BASE_URL}/buddypress/v1/members/${userId}?context=view`;
      const url = `${PROXY_URL}${encodeURIComponent(wpUrl)}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Errore caricamento dati membro");
      return await response.json();
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useBpMembers = (perPage = 100) => {
  return useQuery({
    queryKey: ['bp-members', perPage],
    queryFn: async () => {
      const wpUrl = `${BASE_URL}/buddypress/v1/members?per_page=${perPage}&type=active`;
      const url = `${PROXY_URL}${encodeURIComponent(wpUrl)}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Errore caricamento membri");
      return await response.json();
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

      const response = await fetch(`${BASE_URL}/buddypress/v1/members/${userId}/avatar?JWT=${token}`, {
        method: 'POST',
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