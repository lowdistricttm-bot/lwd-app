"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, User, Loader2, ChevronRight, Users } from 'lucide-react';
import { Input } from './ui/input';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewChatModal = ({ isOpen, onClose }: NewChatModalProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (search.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
        .neq('id', currentUserId)
        .limit(10);

      if (!error && data) {
        setResults(data);
      }
      setLoading(false);
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [search, currentUserId]);

  const handleStartChat = (userId: string) => {
    onClose();
    navigate(`/chat/${userId}`);
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
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150]"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[151] bg-zinc-950 border-t border-white/10 p-6 pb-12 rounded-t-[2rem] max-h-[85vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black italic uppercase tracking-tighter">Nuovo Messaggio</h2>
              <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <Input 
                autoFocus
                placeholder="CERCA USERNAME O NOME..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-zinc-900 border-zinc-800 rounded-none h-14 pl-12 font-black uppercase text-xs tracking-widest focus-visible:ring-red-600 placeholder:text-zinc-700"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-red-600" size={32} />
                </div>
              ) : results.length > 0 ? (
                results.map((user) => (
                  <button 
                    key={user.id}
                    onClick={() => handleStartChat(user.id)}
                    className="w-full bg-zinc-900/40 border border-white/5 p-4 flex items-center gap-4 hover:border-red-600/30 hover:bg-zinc-900 transition-all group"
                  >
                    <div className="w-12 h-12 bg-zinc-800 rounded-full overflow-hidden border border-white/10 shrink-0">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} className="w-full h-full object-cover" alt={user.username} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={20} /></div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <h4 className="text-sm font-black italic uppercase tracking-tight truncate">
                        {user.username || 'Membro District'}
                      </h4>
                      <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest truncate">
                        {user.first_name} {user.last_name}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-zinc-800 group-hover:text-red-600 transition-colors" />
                  </button>
                ))
              ) : search.length >= 2 ? (
                <div className="text-center py-20 flex flex-col items-center gap-4">
                  <Users size={40} className="text-zinc-800" />
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Nessun membro trovato con "{search}"</p>
                </div>
              ) : (
                <div className="text-center py-20 opacity-20">
                  <Search size={48} className="mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Inizia a scrivere per cercare tra i membri</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NewChatModal;