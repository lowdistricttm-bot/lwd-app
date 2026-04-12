import { useQuery } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";
const MEMBERS_CACHE_KEY = 'ld_members_directory';

export const useBpActivity = () => {
  return useQuery({
    queryKey: ['bp-activity'],
    queryFn: async () => {
      const token = localStorage.getItem('ld_auth_token');
      
      if (!token) {
        throw new Error("Effettua l'accesso per vedere la bacheca");
      }

      // Usiamo un timestamp per evitare che il server risponda con una versione "cacheata" dell'errore
      const timestamp = Date.now();
      const url = `${BASE_URL}/buddypress/v1/activity?per_page=20&JWT=${token}&_=${timestamp}`;
      
      try {
        const response = await fetch(url, { 
          method: 'GET',
          headers: { 
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          mode: 'cors'
        });
        
        const data = await response.json();

        if (!response.ok) {
          console.error("BP Error Details:", data);
          if (response.status === 401) {
            throw new Error("Il server non riconosce il tuo accesso. Verifica il codice PHP su WordPress.");
          }
          throw new Error(data.message || "Errore di connessione alla bacheca");
        }
        
        return data;
      } catch (err: any) {
        throw err;
      }
    },
    staleTime: 1000 * 30, // 30 secondi
    retry: 1
  });
};

export const useBpMembers = (perPage = 100) => {
  return useQuery({
    queryKey: ['bp-members', perPage],
    queryFn: async () => {
      const token = localStorage.getItem('ld_auth_token');
      const url = `${BASE_URL}/buddypress/v1/members?per_page=${perPage}&type=active&JWT=${token}`;
      
      const response = await fetch(url, {
        headers: { 
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (!response.ok) throw new Error("Errore sincronizzazione membri");
      return response.json();
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const getCachedMembers = () => {
  const cached = localStorage.getItem(MEMBERS_CACHE_KEY);
  return cached ? JSON.parse(cached) : null;
};