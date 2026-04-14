"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { useMessages } from '@/hooks/use-messages';
import { User, MessageSquare, ChevronRight, Loader2, Plus, Trash2, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import NewChatModal from '@/components/NewChatModal';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Messages = () => {
  const navigate = useNavigate();
  const { conversations, loadingConvs, deleteConversation } = useMessages();
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
      } else {
        setCheckingAuth(false);
      }
    });
  }, [navigate]);

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteConversation.mutateAsync(deleteTarget);
      setDeleteTarget(null);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-32 px-6 max-w-2xl mx-auto w-full">
        <header className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Direct</h2>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">Messaggi</h1>
          </div>
          <button 
            onClick={() => setIsNewChatOpen(true)}
            className="w-12 h-12 bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition-all shadow-lg shadow-white/5"
          >
            <Plus size={24} />
          </button>
        </header>

        {loadingConvs ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-500" size={40} /></div>
        ) : conversations?.length === 0 ? (
          <div className="text-center py-20 border border-white/5 bg-zinc-900/30">
            <MessageSquare className="mx-auto text-zinc-800 mb-6" size={48} />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Nessuna conversazione attiva.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations?.map((conv: any) => (
              <div key={conv.otherId} className="relative overflow-hidden bg-zinc-900/40 border border-white/5 group">
                <div className="absolute inset-0 bg-zinc-800 flex items-center justify-end px-6">
                  <Trash2 size={20} className="text-white" />
                </div>

                <motion.button 
                  drag="x"
                  dragConstraints={{ left: -100, right: 0 }}
                  dragElastic={0.1}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -70) {
                      think
The user wants me to continue my previous response which was cut off.

Looking at the previous response:
- It was updating `src/pages/Messages.tsx`.
- It stopped at: `onDragEnd={(_, info) => { if (info.offset.x < -70) {`

I need to complete the `Messages.tsx` file and then proceed with the other requested changes:
1.  Make the "Direct" section private (already started with `Messages.tsx`).
2.  Make it impossible to apply to events without app access.

I will:
1.  Finish `src/pages/Messages.tsx`.
2.  Update `src/pages/Chat.tsx` to add auth check.
3.  Update `src/pages/Events.tsx` to prevent application without login.
4.  Update `src/hooks/use-events.ts` (though it already has a check, I'll ensure it's robust).

Let's finish `src/pages/Messages.tsx` first.

Wait, the previous response was:
`<dyad-write path="src/pages/Messages.tsx" ...>`
`...`
`onDragEnd={(_, info) => {`
`  if (info.offset.x < -70) {`
`    _`

I will continue from there.

Actually, I should probably rewrite the whole file or at least the block to ensure it's valid. The instructions say "Only use ONE <dyad-write> block per file". Since the previous one was incomplete, I'll provide the full file now.

Then I'll do `Chat.tsx` and `Events.tsx`.

Plan:
1.  Complete `src/pages/Messages.tsx`.
2.  Update `src/pages/Chat.tsx` with auth check.
3.  Update `src/pages/Events.tsx` to handle the "Candidati" button for guest users.
4.  Update `src/hooks/use-events.ts` to ensure the mutation throws if no user.

Let's check `src/pages/Events.tsx`. It already has a `user` state. I should make it so if `!user`, clicking "Candidati" redirects to login or shows a toast.

Let's check `src/pages/Chat.tsx`. It needs a redirect if no session.

Let's check `src/hooks/use-events.ts`. The `applyToEvent` mutation already checks for `user`.

```typescript
  const applyToEvent = useMutation({
    mutationFn: async (data: ApplicationData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi accedere per candidarti");
      ...
```

So the backend/hook side is safe. I just need to fix the UI.

Continuing the response.setDeleteTarget(conv.otherId);
                    }
                  }}
                  onClick={() => navigate(`/chat/${conv.otherId}`)}
                  className="relative w-full bg-zinc-950 p-4 flex items-center gap-4 hover:bg-zinc-900 transition-colors z-10"
                >
                  <div className="w-14 h-14 bg-zinc-800 rounded-full overflow-hidden border border-white/10 shrink-0">
                    {conv.otherUser?.avatar_url ? (
                      <img src={conv.otherUser.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={24} /></div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-sm font-black italic uppercase tracking-tight truncate">
                        {conv.otherUser?.username || 'Membro District'}
                      </h4>
                      <span className="text-[8px] text-zinc-600 font-bold uppercase">
                        {formatDistanceToNow(new Date(conv.lastMessage.created_at), { addSuffix: true, locale: it })}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate font-medium">
                      {conv.lastMessage.content}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-zinc-800 group-hover:text-white transition-colors" />
                </motion.button>
              </div>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-black uppercase italic">Elimina Conversazione?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 text-xs font-bold uppercase">
              Questa azione eliminerà tutti i messaggi con questo utente. Non potrai tornare indietro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none border-white/10 text-white font-black uppercase italic text-[10px]">Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-none bg-zinc-800 text-white font-black uppercase italic text-[10px]">Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <NewChatModal isOpen={isNewChatOpen} onClose={() => setIsNewChatOpen(false)} />
      <BottomNav />
    </div>
  );
};

export default Messages;