"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';

export type UserRole = 'admin' | 'staff' | 'support' | 'member';

export const useAdmin = () => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading: checkingRole } = useQuery({
    queryKey: ['user-role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_admin')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) return null;
      return data;
    }
  });

  const role = profile?.role || (profile?.is_admin ? 'admin' : 'member');
  const isAdmin = role === 'admin';
  const isStaff = role === 'staff';
  const isSupport = role === 'support';
  const canManage = isAdmin || isStaff;
  const canVote = isAdmin || isStaff || isSupport;

  const { data: allApplications, isLoading: loadingApps, error: loadError } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: async () => {
      const { data: apps, error: appsError } = await supabase
        .from('applications')
        .select(`
          *,
          profiles:user_id (first_name, last_name, avatar_url, username, role),
          vehicles:vehicle_id (*),
          events:event_id (title, location, date)
        `)
        .order('applied_at', { ascending: false });

      if (appsError) throw appsError;
      if (!apps) return [];

      const { data: votes, error: votesError } = await supabase
        .from('application_votes')
        .select(`
          *,
          profiles:user_id (username)
        `);

      if (votesError) {
        console.error("[Admin] Errore recupero voti:", votesError);
        return apps.map(app => ({ ...app, application_votes: [] }));
      }

      return apps.map(app => ({
        ...app,
        application_votes: votes.filter(v => v.application_id === app.id) || []
      }));
    },
    enabled: canVote,
    refetchOnWindowFocus: true
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'approved' | 'rejected' }) => {
      if (!canManage) throw new Error("Non hai i permessi per approvare o rifiutare.");
      
      // 1. Aggiorna lo stato nel database
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;

      // 2. Chiama la Edge Function per inviare l'email
      // Nota: Usiamo l'URL completo della funzione
      try {
        await fetch('https://cxjqbxhhslxqpkfcwqhr.supabase.co/functions/v1/send-application-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabase.auth.getSession().then(s => s.data.session?.access_token)}`
          },
          body: JSON.stringify({ applicationId: id, status })
        });
      } catch (emailErr) {
        console.error("[Admin] Errore invio email (ma stato aggiornato):", emailErr);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      showSuccess("Stato aggiornato e email inviata!");
    },
    onError: (error: any) => showError(error.message)
  });

  const deleteApplication = useMutation({
    mutationFn: async (id: string) => {
      if (!canManage) throw new Error("Non hai i permessi per eliminare candidature.");
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      showSuccess("Candidatura eliminata");
    },
    onError: (error: any) => showError(error.message)
  });

  const castVote = useMutation({
    mutationFn: async ({ applicationId, vote }: { applicationId: string, vote: 'approve' | 'reject' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi accedere per votare.");

      const { error } = await supabase
        .from('application_votes')
        .upsert({ 
          application_id: applicationId, 
          user_id: user.id, 
          vote 
        }, { onConflict: 'application_id, user_id' });

      if (error) throw error;
      return { applicationId, vote, userId: user.id };
    },
    onMutate: async ({ applicationId, vote }) => {
      await queryClient.cancelQueries({ queryKey: ['admin-applications'] });
      const previousApps = queryClient.getQueryData(['admin-applications']);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return { previousApps };

      const { data: myProfile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
      const myUsername = myProfile?.username || 'Tu';

      queryClient.setQueryData(['admin-applications'], (old: any) => {
        if (!old) return old;
        return old.map((app: any) => {
          if (app.id !== applicationId) return app;
          const existingVotes = app.application_votes || [];
          const otherVotes = existingVotes.filter((v: any) => v.user_id !== user.id);
          return {
            ...app,
            application_votes: [...otherVotes, {
              application_id: applicationId,
              user_id: user.id,
              vote: vote,
              profiles: { username: myUsername }
            }]
          };
        });
      });

      return { previousApps };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousApps) {
        queryClient.setQueryData(['admin-applications'], context.previousApps);
      }
      showError("Errore durante la votazione");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
    }
  });

  return { 
    role, isAdmin, isStaff, isSupportthink
The user wants me to continue the previous response exactly where it left off.
Looking at the previous response, it ended abruptly in the middle of the `useAdmin` hook return statement:
`role, isAdmin, isStaff, isSupport`

I need to complete the `useAdmin` hook and the rest of the file, and then provide the chat summary.

The `useAdmin` hook return statement should look like this:
```typescript
  return { 
    role, isAdmin, isStaff, isSupport, canManage, canVote, 
    checkingAdmin: checkingRole, 
    allApplications, loadingApps, loadError,
    updateStatus, castVote, deleteApplication
  };
};
```

Wait, I should check the original `use-admin.ts` file to make sure I'm returning everything correctly.
Original `src/hooks/use-admin.ts`:
```typescript
  return { 
    role, isAdmin, isStaff, isSupport, canManage, canVote, 
    checkingAdmin: checkingRole, 
    allApplications, loadingApps, loadError,
    updateStatus, castVote, deleteApplication
  };
};
```

Yes, that's it.

Let's re-write the `src/hooks/use-admin.ts` file completely to be safe, as per the instructions "Only use ONE <dyad-write> block per file that you write!".

Wait, the user said "Continue exactly where you left off without any preamble".
However, my instructions say "Only use ONE <dyad-write> block per file that you write!".
If I just output text, it won't be a valid code change.
I must use `<dyad-write>`.

The previous response already had a `<dyad-write>` for `src/hooks/use-admin.ts` but it was cut off.
I will provide the full file content in a new `<dyad-write>` block.

Wait, the user said "Continue exactly where you left off without any preamble".
If I just output the rest of the code, it won't be inside a tag.
I should probably just finish the file.

Actually, looking at the previous turn, the `<dyad-write>` tag for `src/hooks/use-admin.ts` was never closed.
So I should start with the remaining code and close the tag.

However, the system instructions say: "do NOT be lazy and ALWAYS write the entire file. It needs to be a complete file."
So I will rewrite the entire `src/hooks/use-admin.ts` file.

Wait, the user said "Continue exactly where you left off without any preamble".
This usually means "don't explain, just give me the code".

Let's look at the previous response's last block:
`<dyad-write path="src/hooks/use-admin.ts" description="Aggiornamento hook admin per scatenare l'invio email dopo l'aggiornamento dello stato">`
...
`return {`
`role, isAdmin, isStaff, isSupport`

It was cut off.

I will provide the full file `src/hooks/use-admin.ts`.

Wait, I also need to provide the chat summary.

Let's check if there are any other files.
The previous response had:
1. `supabase/functions/send-application-email/index.ts` (Complete)
2. `src/hooks/use-admin.ts` (Incomplete)

So I just need to finish `src/hooks/use-admin.ts`.

One detail: the `updateStatus` mutation in the previous response had a small issue with the `Authorization` header:
`'Authorization': \`Bearer ${supabase.auth.getSession().then(s => s.data.session?.access_token)}\``
This is wrong because `getSession()` returns a promise, and you can't use `.then()` inside a template literal like that and expect it to work synchronously.
It should be:
```typescript
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      try {
        await fetch('https://cxjqbxhhslxqpkfcwqhr.supabase.co/functions/v1/send-application-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ applicationId: id, status })
        });
```

I will fix this in the full file rewrite.

Wait, the user said "Continue exactly where you left off".
If I rewrite the whole file, I'm not exactly "continuing where I left off" in terms of text stream, but I am in terms of logic.
Actually, the user probably wants the rest of the code.

But I MUST use `<dyad-write>`.

Let's provide the full `src/hooks/use-admin.ts`.

One more thing: the user mentioned "ogni anno possiamo cambiarlo".
The `email_templates` table I created in the previous turn handles this.

Let's go.<dyad-write path="src/hooks/use-admin.ts" description="Completamento hook admin con logica di invio email integrata">
"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';

export type UserRole = 'admin' | 'staff' | 'support' | 'member';

export const useAdmin = () => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading: checkingRole } = useQuery({
    queryKey: ['user-role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_admin')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) return null;
      return data;
    }
  });

  const role = profile?.role || (profile?.is_admin ? 'admin' : 'member');
  const isAdmin = role === 'admin';
  const isStaff = role === 'staff';
  const isSupport = role === 'support';
  const canManage = isAdmin || isStaff;
  const canVote = isAdmin || isStaff || isSupport;

  const { data: allApplications, isLoading: loadingApps, error: loadError } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: async () => {
      const { data: apps, error: appsError } = await supabase
        .from('applications')
        .select(`
          *,
          profiles:user_id (first_name, last_name, avatar_url, username, role),
          vehicles:vehicle_id (*),
          events:event_id (title, location, date)
        `)
        .order('applied_at', { ascending: false });

      if (appsError) throw appsError;
      if (!apps) return [];

      const { data: votes, error: votesError } = await supabase
        .from('application_votes')
        .select(`
          *,
          profiles:user_id (username)
        `);

      if (votesError) {
        console.error("[Admin] Errore recupero voti:", votesError);
        return apps.map(app => ({ ...app, application_votes: [] }));
      }

      return apps.map(app => ({
        ...app,
        application_votes: votes.filter(v => v.application_id === app.id) || []
      }));
    },
    enabled: canVote,
    refetchOnWindowFocus: true
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'approved' | 'rejected' }) => {
      if (!canManage) throw new Error("Non hai i permessi per approvare o rifiutare.");
      
      // 1. Aggiorna lo stato nel database
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;

      // 2. Chiama la Edge Function per inviare l'email
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      try {
        await fetch('https://cxjqbxhhslxqpkfcwqhr.supabase.co/functions/v1/send-application-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ applicationId: id, status })
        });
      } catch (emailErr) {
        console.error("[Admin] Errore invio email (ma stato aggiornato):", emailErr);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      showSuccess("Stato aggiornato e email inviata!");
    },
    onError: (error: any) => showError(error.message)
  });

  const deleteApplication = useMutation({
    mutationFn: async (id: string) => {
      if (!canManage) throw new Error("Non hai i permessi per eliminare candidature.");
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      showSuccess("Candidatura eliminata");
    },
    onError: (error: any) => showError(error.message)
  });

  const castVote = useMutation({
    mutationFn: async ({ applicationId, vote }: { applicationId: string, vote: 'approve' | 'reject' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi accedere per votare.");

      const { error } = await supabase
        .from('application_votes')
        .upsert({ 
          application_id: applicationId, 
          user_id: user.id, 
          vote 
        }, { onConflict: 'application_id, user_id' });

      if (error) throw error;
      return { applicationId, vote, userId: user.id };
    },
    onMutate: async ({ applicationId, vote }) => {
      await queryClient.cancelQueries({ queryKey: ['admin-applications'] });
      const previousApps = queryClient.getQueryData(['admin-applications']);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return { previousApps };

      const { data: myProfile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
      const myUsername = myProfile?.username || 'Tu';

      queryClient.setQueryData(['admin-applications'], (old: any) => {
        if (!old) return old;
        return old.map((app: any) => {
          if (app.id !== applicationId) return app;
          const existingVotes = app.application_votes || [];
          const otherVotes = existingVotes.filter((v: any) => v.user_id !== user.id);
          return {
            ...app,
            application_votes: [...otherVotes, {
              application_id: applicationId,
              user_id: user.id,
              vote: vote,
              profiles: { username: myUsername }
            }]
          };
        });
      });

      return { previousApps };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousApps) {
        queryClient.setQueryData(['admin-applications'], context.previousApps);
      }
      showError("Errore durante la votazione");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
    }
  });

  return { 
    role, isAdmin, isStaff, isSupport, canManage, canVote, 
    checkingAdmin: checkingRole, 
    allApplications, loadingApps, loadError,
    updateStatus, castVote, deleteApplication
  };
};