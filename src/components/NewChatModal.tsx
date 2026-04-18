"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, User, Loader2, ChevronRight, Users, ShieldCheck } from 'lucide-react';
import { Input } from './ui/input';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/use-admin';
import { useBodyLock } from '@/hooks/use-body-lock';
import { cn } from '@/lib/utils';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewChatModal = ({ isOpen, onClose }: NewChatModalProps) => {
  const navigate = useNavigate();
  const { canVote } = useAdmin();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Utilizziamo il nuovo hook per bloccare il background
  useBodyLock(isOpen);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (search.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        let query = supabase
          .from('profiles')
          .select('*')
          .ilike('username', `%${search}%`)
          .neq('id', currentUserId)
          .limit(10);

        if (!canVote) {
          query = query.neq('role', 'subscriber');
        }

        const { data, error } = await query;

        if (error) throw error;
        setResults(data || []);
      } catch (err) {
        console.error("Errore ricerca utenti:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(performSearch, 300);
    return () => clearTimeout(timer);
  }, [search, currentUserId, canVote]);

  const handleStartChat = (user: any) => {
    onClose();
    navigate(`/chat/${user.id}`);
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] touch-none"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[151] bg-zinc-950 border-t border-white/10 p-6 rounded-t-[2rem] max-h-[85dvh] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
            style={{ 
              touchAction: 'pan-y',
              overscrollBehavior: 'contain'
            }}
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-black italic uppercase tracking-tighter">Nuovo Messaggio</h2>
                <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mt-1">Cerca tra i membri del District</p>
              </div>
              <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white transition-colors bg-white/5 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="relative mb-8">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <Input 
                autoFocus
                placeholder="CERCA USERNAME..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white/5 border-white/10 rounded-full h-14 pl-12 font-black uppercase text-xs tracking-widest focus-visible:ring-white/20 placeholder:text-zinc-500 backdrop-blur-md text-white"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-[calc(4rem+env(safe-area-inset-bottom))]" style={{ overscrollBehavior: 'contain' }}>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="animate-spin text-zinc-400" size={32} />
                  <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Ricerca in corso...</p>
                </div>
              ) : results.length > 0 ? (
                <>
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4 px-2 flex items-center gap-2">
                    <Users size={10} /> Membri Trovati
                  </p>
                  {results.map((user: any) => (
                    <button 
                      key={user.id}
                      onClick={() => handleStartChat(user)}
                      className="w-full bg-white/5 backdrop-blur-md border border-white/10 p-4 flex items-center gap-4 hover:border-white/30 hover:bg-white/10 transition-all rounded-[1.5rem] group"
                    >
                      <div className="w-12 h-12 bg-black/40 rounded-full overflow-hidden border border-white/10 shrink-0">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} className="w-full h-full object-cover" alt={user.username} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-500"><User size={20} /></div>
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black italic uppercase tracking-tight truncate text-white group-hover:text-white transition-colors">
                            {user.username || 'Utente'}
                          </h4>
                          {user.is_admin && <ShieldCheck size={12} className="text-white" />}
                        </div>
                        <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">
                          {user.role === 'subscriber' ? 'Iscritto' : 'Membro Ufficiale'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-600 group-hover:text-white transition-colors">
                        <ChevronRight size={18} />
                      </div>
                    </button>
                  ))}
                </>
              ) : search.length >= 2 ? (
                <div className="text-center py-20 flex flex-col items-center gap-4">
                  <Users size={40} className="text-zinc-600" />
                  <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Nessun membro trovato con "{search}"</p>
                </div>
              ) : (
                <div className="text-center py-20 opacity-30">
                  <Search size={48} className="mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Inizia a scrivere per cercare nel District</p>
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