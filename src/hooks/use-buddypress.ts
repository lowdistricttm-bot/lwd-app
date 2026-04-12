import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";

export const useBpActivity = () => {
  return useInfiniteQuery({
    queryKey: ['bp-activity'],
    queryFn: async ({ pageParam = 1 }) => {
      // Carichiamo 20 post alla volta per coprire più velocemente la cronologia
      const url = `${BASE_URL}/lowdistrict/v1/activity?page=${pageParam}&per_page=20&_=${Date.now()}`;
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Errore ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (err: any) {
        console.error("Dettaglio Errore Bridge:", err);
        throw err;
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Se l'ultima pagina ricevuta ha 20 elementi, significa che probabilmente ce ne sono altri
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    staleTime: 1000 * 10, // Considera i dati vecchi dopo 10 secondi per favorire il refresh
    refetchInterval: 1000 * 30, // Controlla nuovi post ogni 30 secondi
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