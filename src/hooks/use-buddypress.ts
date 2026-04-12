import { useQuery } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";

// Chiave per il salvataggio locale
const MEMBERS_CACHE_KEY = 'ld_members_directory';

export const useBpActivity = () => {
  return useQuery({
    queryKey: ['bp-activity'],
    queryFn: async () => {
      const token = localStorage.getItem('ld_auth_token');
      const url = `${BASE_URL}/buddypress/v1/activity?per_page=20${token ? `&JWT=${token}` : ''}`;
      
      const response = await fetch(url, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors'
      });
      
      if (!response.ok) throw new Error("Errore caricamento attività");
      return response.json();
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useBpMembers = (perPage = 100) => {
  return useQuery({
    queryKey: ['bp-members', perPage],
    queryFn: async () => {
      const token = localStorage.getItem('ld_auth_token');
      // populate_extras=true recupera i campi XProfile (auto, modifiche, ecc.)
      const url = `${BASE_URL}/buddypress/v1/members?per_page=${perPage}&type=active&populate_extras=true${token ? `&JWT=${token}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors'
      });
      
      if (!response.ok) throw new Error("Errore sincronizzazione membri");
      
      const data = await response.json();
      
      // Salviamo una copia nel localStorage per l'accesso offline/istantaneo
      localStorage.setItem(MEMBERS_CACHE_KEY, JSON.stringify({
        lastSync: new Date().toISOString(),
        count: data.length,
        users: data
      }));
      
      return data;
    },
    // Carichiamo i dati dalla cache locale se presenti prima di fare la chiamata di rete
    initialData: () => {
      const cached = localStorage.getItem(MEMBERS_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached).users;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 10, // Considera i dati "freschi" per 10 minuti
  });
};

// Funzione helper per recuperare i dati salvati localmente
export const getCachedMembers = () => {
  const cached = localStorage.getItem(MEMBERS_CACHE_KEY);
  return cached ? JSON.parse(cached) : null;
};