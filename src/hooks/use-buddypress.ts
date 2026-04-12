import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";

export const useBpActivity = () => {
  return useInfiniteQuery({
    queryKey: ['bp-activity'],
    queryFn: async ({ pageParam = 1 }) => {
      // Rimuoviamo il timestamp per le pagine successive per mantenere la coerenza della cache
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
        // Assicuriamoci che data sia un array
        return Array.isArray(data) ? data : [];
      } catch (err: any) {
        console.error("Errore caricamento bacheca:", err);
        throw err;
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Se l'ultima pagina ha 20 elementi, chiediamo la successiva
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    staleTime: 1000 * 60, // Aumentiamo a 1 minuto per evitare refresh troppo frequenti che causano salti
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