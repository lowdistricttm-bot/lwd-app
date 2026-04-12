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
        throw new Error(errorData.message || `Errore ${response.status}`);
      } catch (e: any) {
        throw new Error("Errore di connessione: verifica la configurazione CORS su AlterVista.");
      }
    },
    staleTime: 1000 * 60 * 2,
    retry: 1
  });
};