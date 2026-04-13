import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL = "https://www.lowdistrict.it/wp-json";

const bpFetch = async (endpoint: string, options: RequestInit = {}, forceAuth = false) => {
  const token = localStorage.getItem('ld_auth_token');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Funzione interna per eseguire la fetch effettiva
  const doFetch = async (useToken: boolean, useUrlParam: boolean) => {
    let url = `${BASE_URL}${path}`;
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (useToken && token) {
      if (useUrlParam) {
        // Prova a passare il JWT come parametro URL (spesso risolve l'errore 400 del middleware)
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}jwt=${token}`;
      } else {
        // Metodo standard Header
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { ok: false, status: response.status, data: errorData };
    }

    const data = await response.json();
    return { ok: true, data };
  };

  // Strategia:
  // 1. Se non è forzata l'auth, prova prima SENZA token (molti dati BuddyPress sono pubblici)
  if (!forceAuth) {
    const result = await doFetch(false, false);
    if (result.ok) return result.data;think
The user is pointing out that my previous response was cut off. I need to continue the code block for `src/hooks/use-buddypress.ts` exactly where it left off.

Looking at the previous output:
```typescript
  // Strategia:
  // 1. Se non è forzata l'auth, prova prima SENZA token (molti dati BuddyPress sono pubblici)
  if (!forceAuth) {
    const result = await doFetch(false, false);
    if (result.ok) return result.data;
```

I need to finish the `bpFetch` function and the rest of the file.

Plan:
1. Complete the `bpFetch` logic (retry with token in header, then retry with token in URL if needed).
2. Complete the exported hooks (`useBpMembers`, `useBpActivity`, `useActivityActions`, `useBpProfile`).
3. Ensure the file is syntactically correct.

The error reported by the user was:
`"message": "Unable to find user jwt property in JWT.", "errorCode": 30, "type": "simple-jwt-login-middleware"`
This happens when the middleware is active but the token is malformed or missing expected claims.
By trying without auth first, we avoid the middleware if the endpoint is public.
If it's private, we try with auth.

Let's continue the code.// 2. Se fallisce o se l'auth è forzata, prova con Header Authorization
    const authResult = await doFetch(true, false);
    if (authResult.ok) return authResult.data;

    // 3. Se ancora fallisce con errore 400/401, prova l'ultima spiaggia: JWT come parametro URL
    if (authResult.status === 400 || authResult.status === 401) {
      const urlParamResult = await doFetch(true, true);
      if (urlParamResult.ok) return urlParamResult.data;
      
      // Se arriviamo qui, lanciamo l'errore definitivo
      if (urlParamResult.status === 401) throw new Error("401");
      throw new Error(urlParamResult.data?.message || `Errore ${urlParamResult.status}`);
    }

    throw new Error(authResult.data?.message || "Errore di connessione");
  } catch (err: any) {
    console.error(`[BuddyPress API Error]`, err);
    if (err.message === "401") throw err;
    throw new Error("NETWORK_OR_CORS_ERROR");
  }
};

// --- MEMBRI ---
export const useBpMembers = (perPage = 20) => {
  return useQuery({
    queryKey: ['bp-members', perPage],
    queryFn: () => bpFetch(`/buddypress/v1/members?per_page=${perPage}&type=active`),
    staleTime: 1000 * 60 * 5,
    retry: 1
  });
};

// --- BACHECA (ACTIVITY) ---
export const useBpActivity = (userId?: number) => {
  return useInfiniteQuery({
    queryKey: ['bp-activity', userId],
    queryFn: async ({ pageParam = 1 }) => {
      let endpoint = `/buddypress/v1/activity?page=${pageParam}&per_page=10&display_name=1`;
      if (userId) endpoint += `&user_id=${userId}`;
      
      const data = await bpFetch(endpoint);
      return Array.isArray(data) ? data : [];
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage && lastPage.length === 10 ? allPages.length + 1 : undefined;
    },
    retry: 1
  });
};

// --- AZIONI ACTIVITY ---
export const useActivityActions = () => {
  const queryClient = useQueryClient();

  const postActivity = useMutation({
    mutationFn: (content: string) => bpFetch('/buddypress/v1/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        content, 
        component: 'activity', 
        type: 'activity_update' 
      })
    }, true), // Forza auth per scrivere
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bp-activity'] })
  });

  const favoriteActivity = useMutation({
    mutationFn: (id: number) => bpFetch(`/buddypress/v1/activity/${id}/favorite`, { method: 'POST' }, true),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bp-activity'] })
  });

  return { postActivity, favoriteActivity };
};

// --- PROFILO (XPROFILE) ---
export const useBpProfile = (userId: number | undefined) => {
  return useQuery({
    queryKey: ['bp-profile', userId],
    queryFn: () => bpFetch(`/buddypress/v1/members/${userId}/xprofile`, {}, true),
    enabled: !!userId,
  });
};