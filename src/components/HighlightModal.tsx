"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Loader2, Check } from 'lucide-react';
import { useHighlights } from '@/hooks/use-highlights';
import { useBodyLock } from '@/hooks/use-body-lock';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface HighlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: any;
  userId: string;
  bottomOffset?: string;
}

const HighlightModal = ({ isOpen, onClose, story, userId, bottomOffset = '0px' }: HighlightModalProps) => {
  const { highlights, createHighlight, addToHighlight, isLoading } = useHighlights(userId);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Blocco background
  useBodyLock(isOpen);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await createHighlight.mutateAsync({ 
      title: newTitle, 
      storyId: story.id, 
      coverUrl: story.image_url 
    });
    onClose();
  };

  const handleSelect = async (highlightId: string) => {
    await addToHighlight.mutateAsync({ highlightId, storyId: story.id });
    onClose();
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[400] touch-none" 
          />
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 z-[401] bg-black/60 backdrop-blur-2xl border border-white/10 p-5 pb-10 rounded-[2.5rem] max-h-[60dvh] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
            style={{ 
              touchAction: 'pan-y',
              overscrollBehavior: 'contain',
              bottom: bottomOffset
            }}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black italic uppercase tracking-tighter">Metti in evidenza</h3>
              <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white bg-white/5 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar pb-10">
              {isCreating ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full border-2 border-white/20 overflow-hidden bg-zinc-900">
                      <img src={story.image_url} className="w-full h-full object-cover" alt="Cover" />
                    </div>
                  </div>
                  <Input 
                    placeholder="NOME RACCOLTA" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value.toUpperCase())}
                    className="bg-black/40 border-white/10 rounded-full h-14 text-center font-black uppercase tracking-widest"
                  />
                  <div className="flex gap-3">
                    <Button onClick={() => setIsCreating(false)} variant="outline" className="flex-1 border-white/10 rounded-full h-12 font-black uppercase italic">Annulla</Button>
                    <Button onClick={handleCreate} disabled={createHighlight.isPending} className="flex-1 bg-white text-black rounded-full h-12 font-black uppercase italic">
                      {createHighlight.isPending ? <Loader2 className="animate-spin" /> : 'Aggiungi'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <button 
                    onClick={() => setIsCreating(true)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center group-hover:border-white transition-all">
                      <Plus size={24} className="text-zinc-500 group-hover:text-white" />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Nuova</span>
                  </button>

                  {highlights?.map((h) => (
                    <button 
                      key={h.id} 
                      onClick={() => handleSelect(h.id)}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className="w-20 h-20 rounded-full border-2 border-white/10 overflow-hidden bg-zinc-900 group-hover:border-white transition-all relative">
                        <img src={h.cover_url} className="w-full h-full object-cover" alt={h.title} />
                        {addToHighlight.isPending && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="animate-spin text-white" size={16} /></div>}
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300 truncate w-full text-center">{h.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HighlightModal;