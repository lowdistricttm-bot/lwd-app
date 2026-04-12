import { useQuery } from "@tanstack/react-query";

const CK = "ck_9fb51bb84b02dbc2bbc4c9a602de478ca33079ea";
const CS = "cs_225bea698a3c9bf46cda04bf57a630a6b15034a9";
const URL = "https://www.lowdistrict.it/wp-json/buddyboss/v1";

const auth = btoa(`${CK}:${CS}`);

export const useBbActivity = () => {
  return useQuery({
    queryKey: ['bb-activity'],
    queryFn: async () => {
      const response = await fetch(`${URL}/activity?per_page=20&display=full`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Errore nel caricamento della bacheca');
      return response.json();
    },
    staleTime: 1000 * 60 * 2, // 2 minuti
  });
};