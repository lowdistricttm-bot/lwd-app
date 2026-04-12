import { useQuery } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";
const MEMBERS_CACHE_KEY = 'ld_members_directory';

export const useBpActivity = () => {
  return useQuery({
    queryKey: ['bp-activity'],
    queryFn: async () => {
      const token = localStorage.getItem('ld_auth_token');
      
      // Se non c'è il token, non proviamo nemmeno la chiamata per evitare errori inutili
      if (!token) {
        throw new Error("Devi accedere per vedere la bacheca");
      }

      // Usiamo il parametro JWT (maiuscolo) che è lo standard di Simple JWT Login
      // Aggiungiamo anche un parametro casuale per evitare la cache del server
      const url = `${BASE_URL}/buddypress/v1/activity?per_page=20&JWT=${token}&_=${Date.now()}`;
      
      try {
        const response = await fetch(url, { 
          method: 'GET',
          headers: { 
            'Accept': 'application/json'
          },
          mode: 'cors'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          if (response.status === 401 || response.status === 403) {
            throw new Error("Sessione scaduta o non autorizzata. Prova a rifare il login.");
          }
          
          throw new Error(errorData.message || `Errore ${response.status}`);
        }
        
        return response.json();
      } catch (err: any) {
        console.error("BP Activity Fetch Error:", err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 2,
    retry: 1
  });
};

export const useBpMembers = (perPage = 100) => {
  return useQuery({
    queryKey: ['bp-members', perPage],
    queryFn: async () => {
      const token = localStorage.getItem('ld_auth_token');
      const url = `${BASE_URL}/buddypress/v1/members?per_page=${perPage}&type=active${token ? `&JWT=${token}` : ''}`;
      
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