import { useQuery } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";
const MEMBERS_CACHE_KEY = 'ld_members_directory';

export const useBpActivity = () => {
  return useQuery({
    queryKey: ['bp-activity'],
    queryFn: async () => {
      const token = localStorage.getItem('ld_auth_token');
      // Aggiungiamo context=view e un timestamp per evitare cache vecchie del server
      const url = `${BASE_URL}/buddypress/v1/activity?per_page=20&context=view&_=${Date.now()}${token ? `&JWT=${token}` : ''}`;
      
      try {
        const response = await fetch(url, { 
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          mode: 'cors'
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `Errore ${response.status}`;
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorMessage;
          } catch (e) {
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
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
      const url = `${BASE_URL}/buddypress/v1/members?per_page=${perPage}&type=active&populate_extras=true${token ? `&JWT=${token}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors'
      });
      
      if (!response.ok) throw new Error("Errore sincronizzazione membri");
      
      const data = await response.json();
      localStorage.setItem(MEMBERS_CACHE_KEY, JSON.stringify({
        lastSync: new Date().toISOString(),
        count: data.length,
        users: data
      }));
      
      return data;
    },
    initialData: () => {
      const cached = localStorage.getItem(MEMBERS_CACHE_KEY);
      return cached ? JSON.parse(cached).users : undefined;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const getCachedMembers = () => {
  const cached = localStorage.getItem(MEMBERS_CACHE_KEY);
  return cached ? JSON.parse(cached) : null;
};