import { useQuery } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";

export const useBpActivity = () => {
  return useQuery({
    queryKey: ['bp-activity'],
    queryFn: async () => {
      const token = localStorage.getItem('ld_auth_token');
      const headers: HeadersInit = { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const endpoints = ['/buddypress/v1/activity', '/bp/v1/activity'];
      let lastError = "";
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${BASE_URL}${endpoint}?per_page=10&display_name=true`, { 
            headers,
            mode: 'cors' // Forza il controllo CORS
          });
          
          if (response.ok) return response.json();
          
          const errorData = await response.json().catch(() => ({}));
          lastError = errorData.message || `Errore ${response.status}`;
        } catch (e: any) {
          lastError = e.message || "Errore di connessione di rete (CORS?)";
        }
      }

      throw new Error(lastError);
    },
    staleTime: 1000 * 60 * 2,
    retry: 1
  });
};