"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, ChevronRight, Loader2, Users } from 'lucide-react';
import { useFollowList } from '@/hooks/use-follow';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  username: string;
  type: 'followers' | 'following';
}

const FollowListModal = ({ isOpen, onClose, userId, username, type }: FollowListModalProps) => {
  const navigate = useNavigate();
  const { data: list, isLoading } = useFollowList(userId, type);

  // Scroll Lock Logic
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  const title = type === 'followers' ? 'Follower' : 'Seguiti';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]" />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[1001] bg-black/60 backdrop-blur-2xl border-t border-white/10 p-6 pb-15 rounded-t-[2.5rem] max-h-[85vh] flex flex-col shadow-2xl"
            style={{ touchAction: 'pan-y' }}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">{title}</h3>
                <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mt-1">Community di @{username}</p>
              </div>
              <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-24">
              {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-500" /></div>
              ) : list?.length === 0 ? (
                <div className="text-center py-20 opacity-20"><Users size={48} className="mx-auto mb-4" /><p className="text-[10px] font-black uppercase tracking-widest">Nessun utente in questa lista</p></div>
              ) : (
                list?.map((user: any) => (
                  <button key={user.id} onClick={() => { onClose(); navigate(`/profile/${user.id}`); }} className="w-full flex items-center justify-between p-4 bg-white/5 backdrop-blur-md border border-white/5 rounded-[1.5rem] hover:bg-white/10 transition-all group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 bg-black/40 rounded-full overflow-hidden border border-white/10 group-hover:border-white transition-colors shrink-0">{user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" alt={user.username} /> : <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={20} /></div>}</div>
                      <div className="text-left min-w-0"><span className="text-sm font-black italic uppercase text-white group-hover:text-white transition-colors truncate block">{user.username}</span><p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">{user.role === 'subscriber' ? 'Iscritto' : 'Membro Ufficiale'}</p></div>
                    </div>
                    <ChevronRight size={18} className="text-zinc-700 group-hover:text-white transition-all translate-x-[-4px] group-hover:translate-x-0" />
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

export default FollowListModal;