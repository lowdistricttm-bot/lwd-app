"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Heart, MessageSquare, ClipboardCheck, User, Loader2 } from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDrawer = ({ isOpen, onClose }: NotificationDrawerProps) => {
  const navigate = useNavigate();
  const { notifications, isLoading, markAllAsRead } = useNotifications();

  const handleNotificationClick = (n: Notification) => {
    onClose();
    if (n.type === 'like' || n.type === 'comment') {
      navigate('/bacheca');
    } else if (n.type === 'application_status') {
      navigate('/profile');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={14} className="text-red-500 fill-red-500" />;
      case 'comment': return <MessageSquare size={14} className="text-blue-500" />;
      case 'application_status': return <ClipboardCheck size={14} className="text-green-500" />;
      default: return <Bell size={14} />;
    }
  };

  const getMessage = (n: Notification) => {
    const actorName = n.actor?.username || 'Qualcuno';
    switch (n.type) {
      case 'like': return <><span className="font-black">{actorName}</span> ha messo like al tuo post</>;
      case 'comment': return <><span className="font-black">{actorName}</span> ha commentato il tuo post</>;
      case 'application_status': 
        const status = n.applications?.status === 'approved' ? 'APPROVATA' : 'NEGATA';
        return <>La tua candidatura per <span className="font-black">{n.applications?.events?.title}</span> è stata <span className="font-black">{status}</span></>;
      default: return 'Nuova notifica';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-zinc-950 border-l border-white/10 z-[101] flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-zinc-400" />
                <h2 className="text-xl font-black italic uppercase tracking-tighter">Notifiche</h2>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => markAllAsRead.mutate()}
                  className="text-[8px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                >
                  Segna come lette
                </button>
                <button onClick={onClose} className="p-2 hover:bg-white/5 transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="animate-spin text-zinc-800" size={32} />
                </div>
              ) : notifications?.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                  <Bell size={48} className="mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Nessuna notifica</p>
                </div>
              ) : (
                notifications?.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={cn(
                      "w-full p-4 flex gap-4 text-left transition-all border border-transparent",
                      !n.is_read ? "bg-white/5 border-white/5" : "opacity-60 hover:bg-white/5"
                    )}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 bg-zinc-900 rounded-full overflow-hidden border border-white/10">
                        {n.actor?.avatar_url ? (
                          <img src={n.actor.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-700"><User size={16} /></div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black border border-white/10 rounded-full flex items-center justify-center">
                        {getIcon(n.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-zinc-300 leading-tight mb-1">
                        {getMessage(n)}
                      </p>
                      <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: it })}
                      </p>
                    </div>
                    {!n.is_read && <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationDrawer;