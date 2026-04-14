"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { useMessages } from '@/hooks/use-messages';
import { User, MessageSquare, ChevronRight, Loader2, Plus, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import NewChatModal from '@/components/NewChatModal';
import { motion, AnimatePresence } from 'framer-motion';
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

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteConversation.mutateAsync(deleteTarget);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-32 px-6 max-w-2xl mx-auto w-full">
        <header className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Direct</h2>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">Messaggi</h1>
          </div>
          <button 
            onClick={() => setIsNewChatOpen(true)}
            className="w-12 h-12 bg-red-600 flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-lg shadow-red-600/20"
          >
            <Plus size={24} />
          </button>
        </header>

        {loadingConvs ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" size={40} /></div>
        ) : conversations?.length === 0 ? (
          <div className="text-center py-20 border border-white/5 bg-zinc-900/30">
            <MessageSquare className="mx-auto text-zinc-800 mb-6" size={48} />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Nessuna conversazione attiva.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations?.map((conv: any) => (
              <div key={conv.otherId} className="relative overflow-hidden bg-zinc-900/40 border border-white/5 group">
                {/* Delete Action Background */}
                <div className="absolute inset-0 bg-red-600 flex items-center justify-end px-6">
                  <Trash2 size={20} className="text-white" />
                </div>

                <motion.button 
                  drag="x"
                  dragConstraints={{ left: -100, right: 0 }}
                  dragElastic={0.1}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -70) {
                      setDeleteTarget(conv.otherId);
                    }
                  }}
                  onClick={() => navigate(`/chat/${conv.otherId}`)}
                  className="relative w-full bg-zinc-950 p-4 flex items-center gap-4 hover:bg-zinc-900 transition-colors z-10"
                >
                  <div className="w-14 h-14 bg-zinc-800 rounded-full overflow-hidden border border-white/10 shrink-0">
                    {conv.otherUser?.avatar_url ? (
                      <img src={conv.otherUser.avatar_url} className="w-full h-full object-cover" />
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
                  <ChevronRight size={16} className="text-zinc-800 group-hover:text-red-600 transition-colors" />
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
            <AlertDialogAction onClick={handleDelete} className="rounded-none bg-red-600 text-white font-black uppercase italic text-[10px]">Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <NewChatModal isOpen={isNewChatOpen} onClose={() => setIsNewChatOpen(false)} />
      <BottomNav />
    </div>
  );
};

export default Messages;