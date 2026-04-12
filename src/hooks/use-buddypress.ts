import { useQuery } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";
const MEMBERS_CACHE_KEY = 'ld_members_directory';

export const useBpActivity = () => {
  return useQuery({
    queryKey: ['bp-activity'],
    queryFn: async () => {
      const token = localStorage.getItem('ld_auth_token');
      if (!token) throw new Error("Effettua l'accesso");

      // Usiamo il nuovo endpoint "Bridge" che abbiamo creato con lo snippet PHP
      // Questo evita i blocchi standard di BuddyPress
      const url = `${BASE_URL}/lowdistrict/v1/activity?per_page=20&JWT=${token}`;
      
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Errore server: ${response.status}`);
        return await response.json();
      } catch (err) {
        console.error("Errore Bridge:", err);
        throw new Error("Connessione fallita. Assicurati di aver attivato l'ultimo snippet PHP su WordPress.");
      }
    },
    staleTime: 1000 * 30,
    retry: 1
  });
};

export const useBpMembers = (perPage = 100) => {
  return useQuery({
    queryKey: ['bp-members', perPage],
    queryFn: async () => {
      const token = localStorage.getItem('ld_auth_token');
      // Usiamo lo stesso trucco del JWT nell'URL per i membri
      const url = `${BASE_URL}/buddypress/v1/members?per_page=${perPage}&type=active&JWT=${token}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Errore caricamento membri");
      const data = await response.json();
      
      localStorage.setItem(MEMBERS_CACHE_KEY, JSON.stringify({
        count: data.length,
        lastSync: new Date().toISOString()
      }));
      
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const getCachedMembers = () => {
  const cached = localStorage.getItem(MEMBERS_CACHE_KEY);
  return cached ? JSON.parse(cached) : null;
};