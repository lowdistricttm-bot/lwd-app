"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Heart, MessageSquare, ClipboardCheck, User, Loader2, Trash2, Calendar, Car, UserPlus } from 'lucide-react';
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
  const { notifications, isLoading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const handleNotificationClick = async (n: Notification) => {
    if (!n.is_read) {
      markAsRead.mutate(n.id);
    }
    onClose();
    
    if (n.type === 'like' || n.type === 'comment') {
      if (n.post_id) navigate(`/post/${n.post_id}`);
      else navigate('/bacheca');
    } else if (n.type === 'vehicle_like') {
      navigate(`/profile/${n.user_id}?tab=garage`);
    } else if (n.type === 'application_status') {
      navigate('/profile?tab=selections');
    } else if (n.type.startsWith('event_')) {
      navigate(`/events?view=${n.event_id}`);
    } else if (n.type === 'follow') {
      navigate(`/profile/${n.actor_id}`);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification.mutate(id);
  };

  const getIcon = (type: string) => {
    if (type.startsWith('event_')) return <Calendar size={14} className="text-purple-500" />;
    switch (type) {
      case 'like': return <Heart size={14} className="text-red-500 fill-red-500" />;
      case 'vehicle_like': return <Car size={14} className="text-red-500" />;
      case 'comment': return <MessageSquare size={14} className="text-blue-500" />;
      case 'application_status': return <ClipboardCheck size={14} className="text-green-500" />;
      case 'follow': return <UserPlus size={14} className="text-indigo-500" />;
      default: return <Bell size={14} />;
    }
  };

  const getMessage = (n: Notification) => {
    const actorName = n.actor?.username || 'Membro District';
    switch (n.type) {
      case 'like': return <><span className="font-black">{actorName}</span> ha messo like al tuo post</>;
      case 'comment': return <><span className="font-black">{actorName}</span> ha commentato il tuo post</>;
      case 'vehicle_like': return <><span className="font-black">{actorName}</span> ha apprezzato il tuo veicolo <span className="font-black">{n.vehicles?.brand}</span></>;
      case 'application_status': 
        const status = n.applications?.status === 'approved' ? 'APPROVATA' : 'NEGATA';
        return <>La tua candidatura per <span className="font-black">{n.applications?.events?.title}</span> è stata <span className="font-black">{status}</span></>;
      case 'event_new':
        return <>Disponibile un nuovo evento: <span className="font-black uppercase text-purple-400">{n.event?.title || 'Low District'}</span></>;
      case 'event_open':
        return <>SELEZIONI APERTE per l'evento: <span className="font-black uppercase text-green-400">{n.event?.title || 'Low District'}</span></>;
      case 'event_closed':
        return <>SELEZIONI CHIUSE per l'evento: <span className="font-black uppercase text-red-400">{n.event?.title || 'Low District'}</span></>;
      case 'follow':
        return <><span className="font-black">{actorName}</span> ha iniziato a seguirti</>;
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-black/60 backdrop-blur-2xl border-l border-white/10 z-[101] flex flex-col shadow-2xl pt-[env(safe-area-inset-top)]"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-zinc-400" />
                <h2 className="text-xl font-black italic uppercase tracking-tighter">Notifiche</h2>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => markAllAsRead.mutate()}
                  className="text-[8px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                >
                  Segna tutte lette
                </button>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="animate-spin text-zinc-500" size={32} />
                </div>
              ) : notifications?.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                  <Bell size={48} className="mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Nessuna notifica</p>
                </div>
              ) : (
                notifications?.map((n) => (
                  <div key={n.id} className="relative group">
                    <button
                      onClick={() => handleNotificationClick(n)}
                      className={cn(
                        "w-full p-4 flex gap-4 text-left transition-all border border-transparent rounded-2xl",
                        !n.is_read ? "bg-white/10 border-white/10" : "bg-black/20 hover:bg-white/5"
                      )}
                    >
                      <div className="relative shrink-0">
                        <div className={cn(
                          "w-10 h-10 bg-black/40 rounded-full overflow-hidden border",
                          !n.is_read ? "border-white/40" : "border-white/10"
                        )}>
                          {n.actor?.avatar_url ? (
                            <img src={n.actor.avatar_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={16} /></div>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center">
                          {getIcon(n.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 pr-8">
                        <p className={cn(
                          "text-[11px] leading-tight mb-1",
                          !n.is_read ? "text-white font-medium" : "text-zinc-400"
                        )}>
                          {getMessage(n)}
                        </p>
                        <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: it })}
                        </p>
                      </div>
                      {!n.is_read && <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 shrink-0 animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />}
                    </button>

                    <button
                      onClick={(e) => handleDelete(e, n.id)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 rounded-full text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
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