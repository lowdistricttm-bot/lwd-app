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

      const response = await fetch(`${BASE_URL}/buddypress/v1/activity?per_page=10`, { 
        headers,
        mode: 'cors'
      });
      
      if (!response.ok) throw new Error("Errore caricamento attività");
      return response.json();
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useBpMembers = () => {
  return useQuery({
    queryKey: ['bp-members'],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/buddypress/v1/members?per_page=20&type=active`, {
        mode: 'cors'
      });
      if (!response.ok) throw new Error("Errore caricamento membri");
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
  });
};