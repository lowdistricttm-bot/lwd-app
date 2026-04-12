import { useQuery } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";

export const useBpActivity = () => {
  return useQuery({
    queryKey: ['bp-activity'],
    queryFn: async () => {
      const token = localStorage.getItem('ld_auth_token');
      const headers: HeadersInit = { 
        'Accept': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // AlterVista spesso preferisce l'endpoint abbreviato
      const endpoints = ['/bp/v1/activity', '/buddypress/v1/activity'];
      let lastError = "Impossibile connettersi al server.";
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${BASE_URL}${endpoint}?per_page=10`, { 
            headers,
            method: 'GET',
            mode: 'cors'
          });
          
          if (response.ok) return response.json();
          
          const errorData = await response.json().catch(() => ({}));
          lastError = errorData.message || `Errore Server ${response.status}`;
        } catch (e: any) {
          lastError = "Errore di rete: AlterVista potrebbe bloccare la connessione (CORS).";
        }
      }

      throw new Error(lastError);
    },
    staleTime: 1000 * 60 * 2,
    retry: 1
  });
};