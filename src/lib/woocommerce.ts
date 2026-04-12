const CK = "ck_9fb51bb84b02dbc2bbc4c9a602de478ca33079ea";
const CS = "cs_225bea698a3c9bf46cda04bf57a630a6b15034a9";
const URL = "https://www.lowdistrict.it/wp-json/wc/v3";

const auth = btoa(`${CK}:${CS}`);

export const wcFetch = async (endpoint: string) => {
  const response = await fetch(`${URL}${endpoint}`, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Errore nel caricamento dati da WooCommerce');
  return response.json();
};