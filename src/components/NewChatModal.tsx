"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, User, Loader2, ChevronRight } from 'lucide-react';
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
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (search.length < 2) {
        setUsers([]);
        return;
      }

      setLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, first_name, last_name')
        .neq('id', currentUser?.id)
        .or(`username.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
        .limit(10);

      if (!error && data) setUsers(data);
      setLoading(false);
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [search]);

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
            className="fixed inset-x-0 bottom-0 z-[151] bg-zinc-950 border-t border-white/10 p-6 pb-12 rounded-t-[2rem] max-h-[80vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black italic uppercase tracking-tighter">Nuovo Messaggio</h2>
              <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <Input 
                autoFocus
                placeholder="CERCA MEMBRO DISTRICT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-zinc-900 border-zinc-800 rounded-none h-14 pl-12 font-black uppercase text-xs tracking-widest focus-visible:ring-red-600"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-red-600" /></div>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <button 
                    key={user.id}
                    onClick={() => handleStartChat(user.id)}
                    className="w-full bg-zinc-900/40 border border-white/5 p-4 flex items-center gap-4 hover:border-red-600/30 transition-all group"
                  >
                    <div className="w-12 h-12 bg-zinc-800 rounded-full overflow-hidden border border-white/10 shrink-0">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={20} /></div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-sm font-black italic uppercase tracking-tight">
                        {user.username || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Membro'}
                      </h4>
                      <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Visualizza Profilo</p>
                    </div>
                    <ChevronRight size={16} className="text-zinc-800 group-hover:text-red-600 transition-colors" />
                  </button>
                ))
              ) : search.length >= 2 ? (
                <p className="text-center py-10 text-zinc-600 text-[10px] font-black uppercase tracking-widest">Nessun membro trovato.</p>
              ) : (
                <p className="text-center py-10 text-zinc-600 text-[10px] font-black uppercase tracking-widest">Inizia a scrivere per cercare...</p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NewChatModal;