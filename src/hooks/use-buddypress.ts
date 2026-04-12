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

      // Triplo metodo di invio token per massima compatibilità con i server WordPress
      // 1. Parametro 'JWT' (Standard Simple JWT Login)
      // 2. Parametro 'jwt' (Fallback comune)
      // 3. Parametro '_' (Cache busting)
      const url = `${BASE_URL}/buddypress/v1/activity?per_page=20&JWT=${token}&jwt=${token}&_=${Date.now()}`;
      
      try {
        const response = await fetch(url, { 
          method: 'GET',
          headers: { 
            'Accept': 'application/json',
            // 4. Header Authorization (Metodo standard REST API)
            'Authorization': `Bearer ${token}`
          },
          mode: 'cors'
        });
        
        const data = await response.json();

        if (!response.ok) {
          console.error("Server Response Error:", data);
          
          // Se il server dice che non siamo autorizzati, il token potrebbe essere scaduto
          if (response.status === 401 || data.code === 'bp_rest_authorization_required') {
            throw new Error("Sessione non valida. Prova a fare Logout e rientrare.");
          }
          
          throw new Error(data.message || `Errore server (${response.status})`);
        }
        
        return data;
      } catch (err: any) {
        console.error("BP Activity Fetch Error:", err);
        throw err;
      }
    },
    staleTime: 1000 * 60, // 1 minuto di cache
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