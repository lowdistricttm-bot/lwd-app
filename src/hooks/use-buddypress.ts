import { useQuery } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";

export const useBpActivity = () => {
  return useQuery({
    queryKey: ['bp-activity'],
    queryFn: async () => {
      const token = localStorage.getItem('ld_auth_token');
      // Usiamo il parametro JWT nell'URL perché è il più compatibile con i server WordPress
      const url = `${BASE_URL}/buddypress/v1/activity?per_page=20${token ? `&JWT=${token}` : ''}`;
      
      const response = await fetch(url, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Errore server: ${response.status}`);
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useBpMembers = (perPage = 20) => {
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
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Errore server: ${response.status}`);
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
  });
};