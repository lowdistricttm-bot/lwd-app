"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, User, ChevronRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LikesModalProps {
  isOpen: boolean;
  onClose: () => void;
  likes: { user_id: string; username: string; avatar_url?: string; role?: string }[];
}

const LikesModal = ({ isOpen, onClose, likes }: LikesModalProps) => {
  const navigate = useNavigate();

  // Scroll Lock Logic - Bulletproof for Mobile (HTML + Body)
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[400]" 
          />
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[401] bg-black/60 backdrop-blur-2xl border-t border-white/10 p-6 rounded-t-[2.5rem] max-h-[75vh] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
            style={{ 
              touchAction: 'pan-y',
              overscrollBehavior: 'contain'
            }}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />

            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                  <Heart size={20} className="text-red-500 fill-red-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Piace a</h3>
                  <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mt-1">{likes.length} Apprezzamenti</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-[calc(4rem+env(safe-area-inset-bottom))]" style={{ overscrollBehavior: 'contain' }}>
              {likes.map((liker) => (
                <button 
                  key={liker.user_id} 
                  onClick={() => {
                    onClose();
                    navigate(`/profile/${liker.user_id}`);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-white/5 backdrop-blur-md border border-white/5 rounded-[1.5rem] hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-black/40 rounded-full overflow-hidden border border-white/10 group-hover:border-white transition-colors shrink-0">
                      {liker.avatar_url ? (
                        <img src={liker.avatar_url} className="w-full h-full object-cover" alt={liker.username} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                          <User size={20} />
                        </div>
                      )}
                    </div>
                    <div className="text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black italic uppercase text-white group-hover:text-white transition-colors truncate">
                          {liker.username}
                        </span>
                        {liker.role === 'admin' && <ShieldCheck size={12} className="text-white" />}
                      </div>
                      <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Visualizza Profilo</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-zinc-700 group-hover:text-white transition-all translate-x-[-4px] group-hover:translate-x-0" />
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LikesModal;