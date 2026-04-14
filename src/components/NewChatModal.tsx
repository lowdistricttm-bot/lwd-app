"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, User, Loader2, ChevronRight, Users, Globe } from 'lucide-react';
import { Input } from './ui/input';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { useBPSearchMembers } from '@/hooks/use-buddypress';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewChatModal = ({ isOpen, onClose }: NewChatModalProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data: wpUsers, isLoading: loadingWp } = useBPSearchMembers(search);

  const handleStartChat = async (wpUser: any) => {
    // Sincronizziamo l'utente WP con Supabase se non esiste ancora
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', wpUser.user_login || wpUser.name)
      .maybeSingle();

    // Se l'utente non è in Supabase, usiamo il suo ID WP come riferimento temporaneo o navighiamo
    // In un sistema reale, qui creeresti il record. Per ora navighiamo alla chat.
    onClose();
    navigate(`/chat/${wpUser.id}`);
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
              <div>
                <h2 className="text-xl font-black italic uppercase tracking-tighter">Nuovo Messaggio</h2>
                <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mt-1">Cerca tra tutti i membri del sito ufficiale</p>
              </div>
              <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <Input 
                autoFocus
                placeholder="CERCA USERNAME (ES. @NICKNAME)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-zinc-900 border-zinc-800 rounded-none h-14 pl-12 font-black uppercase text-xs tracking-widest focus-visible:ring-red-600 placeholder:text-zinc-700"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {loadingWp ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="animate-spin text-red-600" size={32} />
                  <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Sincronizzazione con il sito...</p>
                </div>
              ) : wpUsers && wpUsers.length > 0 ? (
                <>
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4 px-2 flex items-center gap-2">
                    <Globe size={10} /> Risultati dal Sito Ufficiale
                  </p>
                  {wpUsers.map((user: any) => (
                    <button 
                      key={user.id}
                      onClick={() => handleStartChat(user)}
                      className="w-full bg-zinc-900/40 border border-white/5 p-4 flex items-center gap-4 hover:border-red-600/30 hover:bg-zinc-900 transition-all group"
                    >
                      <div className="w-12 h-12 bg-zinc-800 rounded-full overflow-hidden border border-white/10 shrink-0">
                        {user.avatar_urls?.full ? (
                          <img src={user.avatar_urls.full} className="w-full h-full object-cover" alt={user.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={20} /></div>
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <h4 className="text-sm font-black italic uppercase tracking-tight truncate">
                          {user.name || 'Membro District'}
                        </h4>
                        <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest truncate">
                          @{user.user_login || 'member'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-800 group-hover:text-red-600 transition-colors">
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Scrivi</span>
                        <ChevronRight size={16} />
                      </div>
                    </button>
                  ))}
                </>
              ) : search.length >= 2 ? (
                <div className="text-center py-20 flex flex-col items-center gap-4">
                  <Users size={40} className="text-zinc-800" />
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Nessun membro trovato con "{search}"</p>
                </div>
              ) : (
                <div className="text-center py-20 opacity-20">
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