"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Camera, Trash2, Plus, Music } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useSocialFeed } from '@/hooks/use-social-feed';
import { useBodyLock } from '@/hooks/use-body-lock';
import { showError } from '@/utils/toast';
import MusicSelector from './MusicSelector';
import { cn } from '@/lib/utils';

const CreatePostModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isMusicSelectorOpen, setIsMusicSelectorOpen] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { createPost } = useSocialFeed();

  useBodyLock(isOpen);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = [...selectedFiles, ...files].slice(0, 10);
      setSelectedFiles(newFiles);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newFiles.map(file => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && selectedFiles.length === 0) return;
    
    try {
      // Passiamo anche music_metadata alla mutation
      await createPost.mutateAsync({ 
        content, 
        files: selectedFiles,
        // @ts-ignore - Aggiungiamo il supporto per la musica
        music_metadata: selectedMusic 
      });
      setContent('');
      setSelectedFiles([]);
      setPreviews([]);
      setSelectedMusic(null);
      onClose();
    } catch (error: any) {
      showError("Errore durante la pubblicazione");
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={onClose} 
              className="fixed inset-0 bg-black/80 z-[1000] touch-none" 
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-[1001] bg-black border-t border-white/10 p-6 pb-15 rounded-t-[2.5rem] max-h-[92dvh] flex flex-col shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />

              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Nuovo Post</h2>
                  <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mt-1">Condividi con il Distretto</p>
                </div>
                <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6 overflow-y-auto no-scrollbar">
                <Textarea 
                  placeholder="Cosa succede nel Distretto?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] bg-transparent border-none text-lg p-0 focus-visible:ring-0 placeholder:text-zinc-800 resize-none font-medium italic text-white"
                />

                {selectedMusic && (
                  <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-800 rounded-lg overflow-hidden">
                        <img src={selectedMusic.cover_url} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase italic text-white">{selectedMusic.title}</p>
                        <p className="text-[8px] font-bold uppercase text-zinc-500">{selectedMusic.artist}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setSelectedMusic(null)} className="p-2 text-zinc-500 hover:text-red-500"><X size={16} /></button>
                  </div>
                )}

                {previews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {previews.map((url, i) => (
                      <div key={i} className="relative aspect-square bg-white/5 rounded-[1.5rem] overflow-hidden border border-white/5 group">
                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeFile(i)} className="absolute top-2 right-2 p-2 bg-black text-white hover:bg-red-600 transition-all rounded-full border border-white/10"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                  <div className="flex gap-3">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" multiple onChange={handleFileChange} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-12 h-12 bg-white/5 border border-white/10 text-zinc-400 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10 transition-all shrink-0"><Camera size={20} /></button>
                    <button 
                      type="button" 
                      onClick={() => setIsMusicSelectorOpen(true)} 
                      className={cn(
                        "w-12 h-12 border rounded-full flex items-center justify-center transition-all shrink-0",
                        selectedMusic ? "bg-white border-white text-black" : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                      )}
                    >
                      <Music size={20} className={selectedMusic ? "animate-pulse" : ""} />
                    </button>
                  </div>
                  <Button type="submit" disabled={(!content.trim() && selectedFiles.length === 0) || createPost.isPending} className="bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] px-10 h-12 rounded-full font-black uppercase italic tracking-widest transition-all duration-300 shadow-xl shadow-white/5 border-none">
                    {createPost.isPending ? <Loader2 className="animate-spin" size={20} /> : <span className="flex items-center gap-2">Pubblica <Send size={16} className="-rotate-12" /></span>}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <MusicSelector 
        isOpen={isMusicSelectorOpen} 
        onClose={() => setIsMusicSelectorOpen(false)} 
        onSelect={(music) => {
          setSelectedMusic(music);
          setIsMusicSelectorOpen(false);
        }}
        selectedMusicId={selectedMusic?.id}
      />
    </>
  );
};

export default CreatePostModal;