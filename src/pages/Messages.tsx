"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { useMessages } from '@/hooks/use-messages';
import { User, MessageSquare, ChevronRight, Loader2, Plus, Trash2 } from 'lucide-react';
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
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">{t.messages.subtitle}</h2>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">{t.messages.title}</h1>
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
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{t.messages.noConvs}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations?.map((conv: any) => {
              const isUnread = !conv.lastMessage.is_read && conv.lastMessage.receiver_id === currentUserId;
              
              return (
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
                        setDeleteTarget(conv.otherId);
                      }
                    }}
                    onClick={() => navigate(`/chat/${conv.otherId}`)}
                    className={cn(
                      "relative w-full p-4 flex items-center gap-4 transition-colors z-10",
                      isUnread ? "bg-zinc-900" : "bg-zinc-950 hover:bg-zinc-900"
                    )}
                  >
                    <div className="relative shrink-0">
                      <div className={cn(
                        "w-14 h-14 bg-zinc-800 rounded-full overflow-hidden border shrink-0",
                        isUnread ? "border-white/40" : "border-white/10"
                      )}>
                        {conv.otherUser?.avatar_url ? (
                          <img src={conv.otherUser.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={24} /></div>
                        )}
                      </div>
                      {isUnread && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border-2 border-black animate-pulse" />
                      )}
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className={cn(
                          "text-sm font-black italic uppercase tracking-tight truncate",
                          isUnread ? "text-white" : "text-zinc-300"
                        )}>
                          {conv.otherUser?.username || 'Membro District'}
                        </h4>
                        <span className={cn(
                          "text-[8px] font-bold uppercase",
                          isUnread ? "text-white" : "text-zinc-600"
                        )}>
                          {formatDistanceToNow(new Date(conv.lastMessage.created_at), { 
                            addSuffix: true, 
                            locale: language === 'it' ? it : enUS 
                          })}
                        </span>
                      </div>
                      <p className={cn(
                        "text-xs truncate font-medium",
                        isUnread ? "text-zinc-200 font-bold" : "text-zinc-500"
                      )}>
                        {conv.lastMessage.content}
                      </p>
                    </div>
                    <ChevronRight size={16} className={cn(
                      "transition-colors",
                      isUnread ? "text-white" : "text-zinc-800 group-hover:text-white"
                    )} />
                  </motion.button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-black uppercase italic">{t.messages.deleteConv}</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 text-xs font-bold uppercase">
              {t.messages.deleteConvDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none border-white/10 text-white font-black uppercase italic text-[10px]">{t.feed.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-none bg-zinc-800 text-white font-black uppercase italic text-[10px]">{t.feed.delete}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <NewChatModal isOpen={isNewChatOpen} onClose={() => setIsNewChatOpen(false)} />
      <BottomNav />
    </div>
  );
};

export default Messages;