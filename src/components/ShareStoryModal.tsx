"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, User, Send, Loader2, ShieldCheck } from 'lucide-react';
import { Input } from './ui/input';
import { supabase } from "@/integrations/supabase/client";
import { useMessages } from '@/hooks/use-messages';
import { useBodyLock } from '@/hooks/use-body-lock';
import { showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

interface ShareStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyUrl: string;
  authorName: string;
}

const ShareStoryModal = ({ isOpen, onClose, storyUrl, authorName }: ShareStoryModalProps) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const { sendMessage } = useMessages();

  // Blocco background
  useBodyLock(isOpen);

  useEffect(() => {
    const performSearch = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUser.id)
        .neq('role', 'subscriber');

      if (search.length < 2) {
        const { data } = await query.limit(5);
        setResults(data || []);
        return;
      }

      setIsLoading(true);
      const { data } = await query
        .ilike('username', `%${search}%`)
        .limit(10);
      setResults(data || []);
      setIsLoading(false);
    };

    performSearch();
  }, [search]);

  const handleShare = async (targetUser: any) => {
    setSendingTo(targetUser.id);
    try {
      await sendMessage.mutateAsync({ 
        receiverId: targetUser.id, 
        content: `Inoltrata la storia di @${authorName}`,
        imageUrl: storyUrl
      });
      showSuccess(`Inviato a ${targetUser.username}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSendingTo(null);
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] touch-none" 
          />
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[301] bg-black/60 backdrop-blur-2xl border-t border-white/10 p-6 rounded-t-[2.5rem] max-h-[80dvh] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
            style={{ 
              touchAction: 'pan-y',
              overscrollBehavior: 'contain'
            }}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />

            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Invia Storia</h3>
                <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mt-1">Inoltra questo contenuto via Direct</p>
              </div>
              <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="relative mb-8">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <Input 
                placeholder="CERCA MEMBRI..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white/5 border-white/10 rounded-full h-14 pl-12 font-black uppercase text-xs tracking-widest focus-visible:ring-white/20 placeholder:text-zinc-600 backdrop-blur-md text-white"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-[calc(4rem+env(safe-area-inset-bottom))]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="animate-spin text-zinc-500" size={32} />
                  <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Ricerca...</p>
                </div>
              ) : (
                results.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-md border border-white/5 rounded-[1.5rem] group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 bg-black/40 rounded-full overflow-hidden border border-white/10 shrink-0">
                        {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="m-auto h-full text-zinc-600" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black italic uppercase truncate text-white">{user.username}</span>
                          {user.is_admin && <ShieldCheck size={12} className="text-white" />}
                        </div>
                        <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Membro Ufficiale</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleShare(user)}
                      disabled={sendingTo === user.id}
                      className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg",
                        sendingTo === user.id ? "bg-zinc-800" : "bg-white text-black hover:scale-110 active:scale-95"
                      )}
                    >
                      {sendingTo === user.id ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="-rotate-12" />}
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

export default ShareStoryModal;