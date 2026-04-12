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

      const timestamp = Date.now();
      // Proviamo a usare solo il parametro JWT nell'URL, che è il più compatibile con lo snippet PHP
      const url = `${BASE_URL}/buddypress/v1/activity?per_page=20&JWT=${token}&_=${timestamp}`;
      
      try {
        const response = await fetch(url, { 
          method: 'GET',
          headers: { 
            'Accept': 'application/json'
            // Rimosso Bearer header per evitare conflitti con il parametro URL
          },
          mode: 'cors'
        });
        
        const data = await response.json();

        if (!response.ok) {
          // Creiamo un errore che contenga lo status code per la diagnostica
          const error: any = new Error(data.message || `Errore Server: ${response.status}`);
          error.status = response.status;
          throw error;
        }
        
        return data;
      } catch (err: any) {
        if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
          throw new Error("Errore di rete o CORS. Verifica che il server accetti chiamate esterne.");
        }
        throw err;
      }
    },
    staleTime: 1000 * 30,
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
        headers: { 'Accept': 'application/json' }
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