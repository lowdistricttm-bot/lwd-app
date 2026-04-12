import { useQuery } from "@tanstack/react-query";

const CK = "ck_9fb51bb84b02dbc2bbc4c9a602de478ca33079ea";
const CS = "cs_225bea698a3c9bf46cda04bf57a630a6b15034a9";
const URL = "https://www.lowdistrict.it/wp-json/buddyboss/v1";

const auth = btoa(`${CK}:${CS}`);

export const useBbActivity = () => {
  return useQuery({
    queryKey: ['bb-activity'],
    queryFn: async () => {
      try {
        const response = await fetch(`${URL}/activity?per_page=10`, {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('BuddyBoss API Error:', errorText);
          throw new Error(`Errore API: ${response.status}`);
        }
        
        return response.json();
      } catch (err) {
        console.error('Fetch Error:', err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 2,
    retry: 1
  });
};