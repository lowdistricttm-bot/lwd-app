"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, User, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LikesModalProps {
  isOpen: boolean;
  onClose: () => void;
  likes: { user_id: string; username: string; avatar_url?: string }[];
}

const LikesModal = ({ isOpen, onClose, likes }: LikesModalProps) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[400]" 
          />
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }} 
            className="fixed inset-x-0 bottom-0 z-[401] bg-zinc-950 border-t border-white/10 p-6 pb-12 rounded-t-[2rem] max-h-[60vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-red-500 fill-red-500" />
                <h3 className="text-lg font-black italic uppercase tracking-tighter">Piace a</h3>
              </div>
              <button onClick={onClose} className="p-2 text-zinc-500"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {likes.map((liker) => (
                <button 
                  key={liker.user_id} 
                  onClick={() => {
                    onClose();
                    navigate(`/profile/${liker.user_id}`);
                  }}
                  className="w-full flex items-center justify-between p-3 bg-zinc-900/40 border border-white/5 rounded-2xl hover:bg-zinc-900 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-800 rounded-full overflow-hidden border border-white/10 group-hover:border-white transition-colors">
                      {liker.avatar_url ? (
                        <img src={liker.avatar_url} className="w-full h-full object-cover" alt={liker.username} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700">
                          <User size={20} />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-black italic uppercase text-zinc-300 group-hover:text-white transition-colors">
                      {liker.username}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-800 group-hover:text-white transition-colors" />
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