import { useQuery } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";
const MEMBERS_CACHE_KEY = 'ld_members_directory';

export const useBpActivity = () => {
  return useQuery({
    queryKey: ['bp-activity'],
    queryFn: async () => {
      const token = localStorage.getItem('ld_auth_token');
      if (!token) throw new Error("Effettua l'accesso");

      // Proviamo prima con il token nell'URL per evitare il preflight OPTIONS che spesso causa errori CORS
      try {
        const url = `${BASE_URL}/buddypress/v1/activity?per_page=20&JWT=${token}`;
        const response = await fetch(url, { 
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) throw new Error(`Errore: ${response.status}`);
        return await response.json();
      } catch (err: any) {
        console.error("Errore attività:", err);
        throw new Error("Il server rifiuta la connessione (CORS). Verifica lo snippet PHP su WordPress.");
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
      const response = await fetch(url);
      if (!response.ok) throw new Error("Errore membri");
      const data = await response.json();
      
      localStorage.setItem(MEMBERS_CACHE_KEY, JSON.stringify({
        count: data.length,
        lastSync: new Date().toISOString()
      }));
      
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const getCachedMembers = () => {
  const cached = localStorage.getItem(MEMBERS_CACHE_KEY);
  return cached ? JSON.parse(cached) : null;
};