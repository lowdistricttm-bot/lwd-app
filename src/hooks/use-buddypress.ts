import { useQuery } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";

export const useBpActivity = () => {
  return useQuery({
    queryKey: ['bp-activity'],
    queryFn: async () => {
      const token = localStorage.getItem('ld_auth_token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Proviamo prima l'endpoint standard di BuddyPress
      const endpoints = ['/buddypress/v1/activity', '/bp/v1/activity'];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${BASE_URL}${endpoint}?per_page=10&display_name=true`, { headers });
          if (response.ok) return response.json();
        } catch (e) {
          console.error(`Fallito tentativo su ${endpoint}`);
        }
      }

      throw new Error("Impossibile trovare l'API di BuddyPress sul sito.");
    },
    staleTime: 1000 * 60 * 2,
    retry: 1
  });
};