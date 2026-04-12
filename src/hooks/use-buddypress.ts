import { useQuery } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";
const MEMBERS_CACHE_KEY = 'ld_members_directory';

export const useBpActivity = () => {
  return useQuery({
    queryKey: ['bp-activity'],
    queryFn: async () => {
      const token = localStorage.getItem('ld_auth_token');
      
      // Proviamo l'URL senza parametri JWT per vedere se il server lo accetta
      const url = `${BASE_URL}/buddypress/v1/activity?per_page=20`;
      
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };

      // Se abbiamo il token, lo passiamo nell'Header Authorization (metodo standard)
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      try {
        const response = await fetch(url, { 
          method: 'GET',
          headers: headers,
          mode: 'cors'
        });
        
        if (!response.ok) {
          // Se fallisce con l'header, facciamo un ultimo tentativo col parametro URL (ma minuscolo 'jwt')
          const fallbackUrl = `${url}&jwt=${token}`;
          const fallbackRes = await fetch(fallbackUrl, { headers: { 'Accept': 'application/json' } });
          
          if (!fallbackRes.ok) {
            const errorText = await fallbackRes.text();
            let errorMessage = `Errore ${fallbackRes.status}`;
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.message || errorJson.code || errorMessage;
            } catch (e) {
              errorMessage = errorText.substring(0, 100) || errorMessage;
            }
            throw new Error(errorMessage);
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
      const url = `${BASE_URL}/buddypress/v1/members?per_page=${perPage}&type=active&populate_extras=true`;
      
      const headers: Record<string, string> = { 'Accept': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
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