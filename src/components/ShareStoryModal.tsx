"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, User, Send, Loader2, Check } from 'lucide-react';
import { Input } from './ui/input';
import { supabase } from "@/integrations/supabase/client";
import { useMessages } from '@/hooks/use-messages';
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

  useEffect(() => {
    const performSearch = async () => {
      if (search.length < 2) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', user.id)
          .limit(5);
        setResults(data || []);
        return;
      }

      setIsLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('*')
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
      // Inviamo il messaggio con l'URL della storia come immagine allegata
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300]" 
          />
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }} 
            className="fixed inset-x-0 bottom-0 z-[301] bg-zinc-950 border-t border-white/10 p-6 pb-12 rounded-t-[2rem] max-h-[70vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black italic uppercase tracking-tighter">Invia a...</h3>
              <button onClick={onClose} className="p-2 text-zinc-500"><X size={24} /></button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <Input 
                placeholder="CERCA MEMBRI..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-zinc-900 border-zinc-800 rounded-full h-12 pl-12 text-[10px] font-black uppercase tracking-widest"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-zinc-800" /></div>
              ) : (
                results.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-zinc-900/40 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-800 rounded-full overflow-hidden">
                        {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="m-auto h-full text-zinc-700" />}
                      </div>
                      <span className="text-xs font-black italic uppercase">{user.username}</span>
                    </div>
                    <button 
                      onClick={() => handleShare(user)}
                      disabled={sendingTo === user.id}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                        sendingTo === user.id ? "bg-zinc-800" : "bg-white text-black hover:scale-110"
                      )}
                    >
                      {sendingTo === user.id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
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