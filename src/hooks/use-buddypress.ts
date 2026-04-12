import { useQuery } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";
const MEMBERS_CACHE_KEY = 'ld_members_directory';

export const useBpActivity = () => {
  return useQuery({
    queryKey: ['bp-activity'],
    queryFn: async () => {
      const token = localStorage.getItem('ld_auth_token');
      
      // Proviamo a usare un URL pulitissimo
      const url = `${BASE_URL}/buddypress/v1/activity?per_page=10`;
      
      try {
        const response = await fetch(url, { 
          method: 'GET',
          headers: { 
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          mode: 'cors'
        });
        
        if (!response.ok) {
          // Se fallisce, proviamo l'ultimo metodo disperato: passare il token come parametro 'jwt' minuscolo
          const fallbackUrl = `${url}&jwt=${token}`;
          const fallbackRes = await fetch(fallbackUrl);
          
          if (!fallbackRes.ok) {
            const errorData = await fallbackRes.json().catch(() => ({ message: `Errore ${fallbackRes.status}` }));
            throw new Error(errorData.message || errorData.code || "Errore API");
          }
          return fallbackRes.json();
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
      const url = `${BASE_URL}/buddypress/v1/members?per_page=${perPage}&type=active`;
      
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