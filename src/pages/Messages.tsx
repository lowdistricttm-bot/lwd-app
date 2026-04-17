"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { useMessages } from '@/hooks/use-messages';
import { useAdmin } from '@/hooks/use-admin';
import { User, MessageSquare, ChevronRight, Loader2, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import NewChatModal from '@/components/NewChatModal';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
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
  const { t, language } = useTranslation();
  const { conversations, loadingConvs, deleteConversation } = useMessages();
  const { role, checkingAdmin } = useAdmin();
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const isDragging = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
      } else {
        setCurrentUserId(session.user.id);
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

  if (checkingAuth || checkingAdmin) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-zinc-500" size={40} /></div>;
  }

  if (role === 'subscriber') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <ShieldAlert size={64} strokeWidth={1.5} className="text-zinc-800 mb-6" />
          <h1 className="text-2xl font-black uppercase italic mb-4">Accesso Limitato</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">I messaggi privati sono riservati ai membri ufficiali del District.</p>
          <button onClick={() => navigate('/')} className="bg-white text-black h-12 px-8 rounded-full font-black uppercase italic hover:bg-zinc-200 transition-all">Torna alla Home</button>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-32 px-6 max-w-2xl mx-auto w-full">
        <header className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">{t.messages.subtitle}</h2>
            <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase">{t.messages.title}</h1>
          </div>
          <button 
            onClick={() => setIsNewChatOpen(true)} 
            className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </header>

        {loadingConvs ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-500" size={40} /></div>
        ) : conversations?.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/20 border border-white/5 rounded-[2rem]"><MessageSquare className="mx-auto text-zinc-800 mb-6" size={48} strokeWidth={1.5} /><p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{t.messages.noConvs}</p></div>
        ) : (
          <div className="space-y-3">
            {conversations?.map((conv: any) => {
              const isUnread = !conv.lastMessage.is_read && conv.lastMessage.receiver_id === currentUserId;
              
              return (
                <div 
                  key={conv.otherId} 
                  className={cn(
                    "relative overflow-hidden rounded-[2rem] border transition-all duration-300 group",
                    isUnread 
                      ? "bg-white/10 backdrop-blur-2xl border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.15)]" 
                      : "bg-zinc-900/40 border-white/5 shadow-none"
                  )}
                >
                  <div className="absolute inset-0 bg-red-950/40 flex items-center justify-end px-8">
                    <Trash2 size={24} strokeWidth={2} className="text-red-400/80" />
                  </div>
                  
                  <motion.div 
                    drag="x" 
                    dragSnapToOrigin={true}
                    dragConstraints={{ left: -100, right: 0 }} 
                    dragElastic={0.1} 
                    onDragStart={() => {
                      isDragging.current = true;
                    }}
                    onDragEnd={(_, info) => { 
                      setTimeout(() => {
                        isDragging.current = false;
                      }, 150);
                      
                      if (info.offset.x < -50) {
                        setDeleteTarget(conv.otherId); 
                      }
                    }} 
                    onClick={(e) => {
                      if (isDragging.current) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                      navigate(`/chat/${conv.otherId}`);
                    }} 
                    className={cn(
                      "relative w-full p-5 flex items-center gap-4 transition-colors z-10 cursor-pointer", 
                      isUnread ? "bg-transparent" : "bg-zinc-950 hover:bg-zinc-900"
                    )}
                  >
                    <div className="relative shrink-0">
                      <div className={cn("w-14 h-14 rounded-full overflow-hidden border-2 shrink-0 bg-black/40", isUnread ? "border-white" : "border-white/10")}>
                        {conv.otherUser?.avatar_url ? (
                          <img src={conv.otherUser.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-500"><User size={24} strokeWidth={1.5} /></div>
                        )}
                      </div>
                      {isUnread && <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-white rounded-full border-2 border-black animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]" />}
                    </div>
                    <div className="flex-1 text-left min-w-0 pointer-events-none">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className={cn("text-sm font-black italic uppercase tracking-tight truncate", isUnread ? "text-white" : "text-zinc-300")}>
                          {conv.otherUser?.username || 'Membro District'}
                        </h4>
                        <span className={cn("text-[8px] font-bold uppercase", isUnread ? "text-white" : "text-zinc-500")}>
                          {formatDistanceToNow(new Date(conv.lastMessage.created_at), { addSuffix: true, locale: language === 'it' ? it : enUS })}
                        </span>
                      </div>
                      <p className={cn("text-xs truncate font-medium", isUnread ? "text-white font-bold" : "text-zinc-500")}>
                        {conv.lastMessage.content}
                      </p>
                    </div>
                    <ChevronRight size={18} strokeWidth={2} className={cn("transition-colors", isUnread ? "text-white" : "text-zinc-600 group-hover:text-white")} />
                  </motion.div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-black/60 backdrop-blur-2xl border-white/10 rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-black uppercase italic">{t.messages.deleteConv}</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-xs font-bold uppercase">{t.messages.deleteConvDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2">
            <AlertDialogAction onClick={handleDelete} className="rounded-full bg-white text-black font-black uppercase italic text-[10px] h-12 hover:bg-zinc-200">
              Elimina
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-full border-white/10 text-white bg-transparent hover:bg-white/10 font-black uppercase italic text-[10px] h-12 mt-0 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
              Annulla
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <NewChatModal isOpen={isNewChatOpen} onClose={() => setIsNewChatOpen(false)} />
      <BottomNav />
    </div>
  );
};

export default Messages;