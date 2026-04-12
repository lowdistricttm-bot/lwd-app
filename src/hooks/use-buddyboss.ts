import { useQuery } from "@tanstack/react-query";

const URL = "https://www.lowdistrict.it/wp-json/buddyboss/v1";

export const useBbActivity = () => {
  return useQuery({
    queryKey: ['bb-activity'],
    queryFn: async () => {
      // Recuperiamo il token JWT se l'utente è loggato
      const token = localStorage.getItem('ld_auth_token');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      try {
        // Parametri ottimizzati per la bacheca: 10 post, includendo i dati dell'utente
        const response = await fetch(`${URL}/activity?per_page=10&display_name=true`, {
          headers
        });
        
        if (!response.ok) {
          // Se fallisce con auth, proviamo senza (alcuni feed sono pubblici)
          if (token && response.status === 401) {
            const publicRes = await fetch(`${URL}/activity?per_page=10`);
            if (publicRes.ok) return publicRes.json();
          }
          throw new Error(`Errore API: ${response.status}`);
        }
        
        return response.json();
      } catch (err) {
        console.error('BuddyBoss Fetch Error:', err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 2, // Cache di 2 minuti
    retry: 1
  });
};