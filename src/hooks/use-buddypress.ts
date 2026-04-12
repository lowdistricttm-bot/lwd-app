import { useQuery } from "@tanstack/react-query";

const URL = "https://www.lowdistrict.it/wp-json/buddypress/v1";

export const useBpActivity = () => {
  return useQuery({
    queryKey: ['bp-activity'],
    queryFn: async () => {
      const token = localStorage.getItem('ld_auth_token');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      try {
        // Endpoint ufficiale BuddyPress per l'attività
        const response = await fetch(`${URL}/activity?per_page=10&display_name=true`, {
          headers
        });
        
        if (!response.ok) {
          if (token && response.status === 401) {
            const publicRes = await fetch(`${URL}/activity?per_page=10`);
            if (publicRes.ok) return publicRes.json();
          }
          throw new Error(`Errore BuddyPress: ${response.status}`);
        }
        
        return response.json();
      } catch (err) {
        console.error('BuddyPress Fetch Error:', err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 2,
    retry: 1
  });
};