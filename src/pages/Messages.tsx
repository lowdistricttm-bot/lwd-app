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
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
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
  const [convToDelete, setConvToDelete] = useState<string | null>(null);

  const confirmDelete = () => {
    if (convToDelete) {
      deleteConversation.mutate(convToDelete);
      setConvToDelete(null);
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
            <AnimatePresence>
              {conversations?.map((conv: any) => (
                <ConversationItem 
                  key={conv.otherId} 
                  conv={conv} 
                  onNavigate={() => navigate(`/chat/${conv.otherId}`)}
                  onDeleteRequest={(id) => setConvToDelete(id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <AlertDialog open={!!convToDelete} onOpenChange={() => setConvToDelete(null)}>
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black italic uppercase tracking-tighter">Elimina Conversazione?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
              Questa azione eliminerà definitivamente tutti i messaggi scambiati con questo utente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-none border-zinc-800 font-black uppercase italic text-[10px] tracking-widest">Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-none bg-red-600 hover:bg-white hover:text-black font-black uppercase italic text-[10px] tracking-widest">Elimina Tutto</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <NewChatModal isOpen={isNewChatOpen} onClose={() => setIsNewChatOpen(false)} />
      <BottomNav />
    </div>
  );
};

// Componente interno per gestire lo swipe della conversazione
const ConversationItem = ({ conv, onNavigate, onDeleteRequest }: { conv: any, onNavigate: () => void, onDeleteRequest: (id: string) => void }) => {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);
  const scale = useTransform(x, [-100, -50, 0], [1, 0.8, 0.5]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x < -80) {
      onDeleteRequest(conv.otherId);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Action (Trash Icon) */}
      <motion.div 
        style={{ opacity, scale }}
        className="absolute inset-y-0 right-0 w-24 bg-red-600 flex items-center justify-center z-0"
      >
        <Trash2 size={24} className="text-white" />
      </motion.div>

      <motion.div 
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        onClick={onNavigate}
        className={cn(
          "w-full border p-4 flex items-center gap-4 transition-all group relative cursor-pointer z-10 touch-pan-y",
          conv.isUnread 
            ? "bg-zinc-900 border-red-600/50" 
            : "bg-zinc-900/40 border-white/5 hover:border-red-600/30"
        )}
      >
        {conv.isUnread && (
          <div className="absolute top-4 right-4 w-2 h-2 bg-red-600 rounded-full animate-pulse" />
        )}
        
        <div className="w-14 h-14 bg-zinc-800 rounded-full overflow-hidden border border-white/10 shrink-0">
          {conv.otherUser?.avatar_url ? (
            <img src={conv.otherUser.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={24} /></div>
          )}
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="flex justify-between items-center mb-1">
            <h4 className={cn(
              "text-sm font-black italic uppercase tracking-tight truncate",
              conv.isUnread ? "text-white" : "text-zinc-300"
            )}>
              {conv.otherUser?.username || 'Membro District'}
            </h4>
            <span className="text-[8px] text-zinc-600 font-bold uppercase">
              {formatDistanceToNow(new Date(conv.lastMessage.created_at), { addSuffix: true, locale: it })}
            </span>
          </div>
          <p className={cn(
            "text-xs truncate font-medium",
            conv.isUnread ? "text-zinc-200 font-bold" : "text-zinc-500"
          )}>
            {conv.lastMessage.content || (conv.lastMessage.image_url ? "📷 Foto" : "")}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <ChevronRight size={16} className="text-zinc-800 group-hover:text-red-600 transition-colors" />
        </div>
      </motion.div>
    </div>
  );
};

export default Messages;