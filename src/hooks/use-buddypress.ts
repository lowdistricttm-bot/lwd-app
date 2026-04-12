import { useQuery } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";

export const useBpActivity = () => {
  return useQuery({
    queryKey: ['bp-activity'],
    queryFn: async () => {
      const token = localStorage.getItem('ld_auth_token');
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      try {
        const response = await fetch(`${BASE_URL}/buddypress/v1/activity?per_page=10`, { 
          headers,
          method: 'GET',
          mode: 'cors'
        });
        
        if (response.ok) return response.json();
        
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 404) {
          throw new Error("API BuddyPress non trovata. Assicurati che il plugin BuddyPress sia attivo e che le 'BP REST API' siano abilitate nelle impostazioni.");
        }
        
        throw new Error(errorData.message || `Errore server: ${response.status}`);
      } catch (e: any) {
        if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
          throw new Error("Errore di connessione (CORS): Il server WordPress sta bloccando la richiesta. Verifica lo snippet su WPCode.");
        }
        throw e;
      }
    },
    staleTime: 1000 * 60 * 2,
    retry: 1
  });
};