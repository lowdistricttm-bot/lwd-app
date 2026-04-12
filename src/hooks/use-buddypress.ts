import { useQuery } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";

export const useBpActivity = () => {
  return useQuery({
    queryKey: ['bp-activity'],
    queryFn: async () => {
      const token = localStorage.getItem('ld_auth_token');
      // Aggiungiamo un timestamp per evitare la cache del browser e avere dati sempre freschi
      const url = `${BASE_URL}/lowdistrict/v1/activity?_=${Date.now()}`;
      
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
          throw new Error(errorData.message || `Errore ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (err: any) {
        console.error("Dettaglio Errore Bridge:", err);
        throw err;
      }
    },
    staleTime: 1000 * 30, // I dati sono considerati "vecchi" dopo 30 secondi
    refetchInterval: 1000 * 60, // Controlla automaticamente nuovi post ogni minuto
    refetchOnWindowFocus: true, // Aggiorna quando l'utente torna sull'app
    retry: 1
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