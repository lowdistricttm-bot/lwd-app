import { useQuery } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";

export const useBpActivity = () => {
  return useQuery({
    queryKey: ['bp-activity'],
    queryFn: async () => {
      const token = localStorage.getItem('ld_auth_token');
      if (!token) throw new Error("Effettua l'accesso per vedere la bacheca");

      // Usiamo il parametro JWT nell'URL per massima compatibilità
      const url = `${BASE_URL}/lowdistrict/v1/activity?JWT=${token}&_=${Date.now()}`;
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors', // Forza la modalità CORS
        });

        if (!response.ok) {
          throw new Error(`Errore Server (${response.status})`);
        }

        return await response.json();
      } catch (err: any) {
        console.error("Dettaglio Errore Bridge:", err);
        // Se l'errore è vuoto, è quasi certamente un problema di CORS o SSL
        throw new Error(err.message || "Errore di connessione (CORS). Verifica lo snippet su WordPress.");
      }
    },
    staleTime: 1000 * 10,
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