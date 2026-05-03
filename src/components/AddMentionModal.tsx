"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, User, Loader2, AtSign, Check, Plus } from 'lucide-react';
import { Input } from './ui/input';
import { supabase } from "@/integrations/supabase/client";
import { useStories } from '@/hooks/use-stories';
import { useBodyLock } from '@/hooks/use-body-lock';
import { cn } from '@/lib/utils';

interface AddMentionModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyId: string;
  storyUrl: string;
  existingMentions: string[];
  musicMetadata?: any;
  bottomOffset?: string;
}

const AddMentionModal = ({ 
  isOpen, 
  onClose, 
  storyId, 
  storyUrl, 
  existingMentions, 
  musicMetadata,
  bottomOffset = '0px' 
}: AddMentionModalProps) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addMention } = useStories();

  useBodyLock(isOpen);

  useEffect(() => {
    if (search.length < 2) {
      setResults([]);
      return;
    }

    const searchUsers = async () => {
      setIsLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      const { data } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${search}%`)
        .neq('id', currentUser?.id)
        .neq('role', 'subscriber')
        .limit(10);
      
      setResults(data || []);
      setIsLoading(false);
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAdd = async (user: any) => {
    await addMention.mutateAsync({ 
      storyId, 
      mentionId: user.id, 
      storyUrl,
      music_metadata: musicMetadata 
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/80 z-[1000] touch-none" 
          />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 z-[1001] bg-black border-t border-white/10 p-6 rounded-[2.5rem] max-h-[90dvh] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
            style={{ 
              touchAction: 'pan-y',
              overscrollBehavior: 'contain',
              bottom: bottomOffset
            }}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
            
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <AtSign size={20} className="text-white" />
                <h3 className="text-lg font-black italic uppercase tracking-tighter">Menziona Membri</h3>
              </div>
              <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white bg-white/5 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <Input 
                placeholder="CERCA USERNAME..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white/5 border-white/10 rounded-full h-12 pl-12 text-[10px] font-black uppercase tracking-widest focus-visible:ring-white/20 text-white"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar pb-10">
              {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-zinc-500" /></div>
              ) : results.length > 0 ? (
                results.map((user) => {
                  const isAlreadyMentioned = existingMentions.includes(user.id);
                  return (
                    <button 
                      key={user.id} 
                      onClick={() => !isAlreadyMentioned && handleAdd(user)}
                      disabled={isAlreadyMentioned || addMention.isPending}
                      className={cn(
                        "w-full flex items-center justify-between p-3 border transition-all group rounded-2xl",
                        isAlreadyMentioned ? "bg-white/5 border-transparent opacity-50" : "bg-white/5 border-white/5 hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-full overflow-hidden border border-white/10">
                          {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="m-auto h-full text-zinc-700" />}
                        </div>
                        <span className="text-xs font-black italic uppercase text-zinc-300 group-hover:text-white transition-colors">
                          {user.username}
                        </span>
                      </div>
                      {isAlreadyMentioned ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Plus size={16} className="text-zinc-600 group-hover:text-white" />
                      )}
                    </button>
                  );
                })
              ) : search.length >= 2 ? (
                <p className="text-center py-10 text-[10px] font-black uppercase text-zinc-600">Nessun membro trovato</p>
              ) : (
                <p className="text-center py-10 text-[10px] font-black uppercase text-zinc-700">Inizia a scrivere per cercare...</p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddMentionModal;