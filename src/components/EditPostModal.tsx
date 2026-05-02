"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Camera, Trash2, Music } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useSocialFeed, Post } from '@/hooks/use-social-feed';
import { useBodyLock } from '@/hooks/use-body-lock';
import { showError } from '@/utils/toast';
import MusicSelector from './MusicSelector';
import { cn } from '@/lib/utils';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
}

const EditPostModal = ({ isOpen, onClose, post }: EditPostModalProps) => {
  const [content, setContent] = useState(post.content);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(post.image_url || null);
  const [removeImage, setRemoveImage] = useState(false);
  const [isMusicSelectorOpen, setIsMusicSelectorOpen] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<any>(post.music_metadata || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { updatePost } = useSocialFeed();

  useBodyLock(isOpen);

  useEffect(() => {
    setContent(post.content);
    setPreviewUrl(post.image_url || null);
    setRemoveImage(false);
    setSelectedFile(null);
    setSelectedMusic(post.music_metadata || null);
  }, [post]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setRemoveImage(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile && !previewUrl) return;
    
    try {
      await updatePost.mutateAsync({ 
        postId: post.id, 
        content, 
        files: selectedFile ? [selectedFile] : undefined,
        removeImages: removeImage,
        music_metadata: selectedMusic // Aggiorna musica
      });
      onClose();
    } catch (error: any) {
      showError("Errore durante l'aggiornamento");
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose} className="fixed inset-0 bg-black/80 z-[150] touch-none"
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-[151] bg-black border-t border-white/10 p-6 rounded-t-[2.5rem] max-h-[90dvh] overflow-y-auto shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />

              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black italic uppercase tracking-tighter">Modifica Post</h2>
                <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white bg-white/5 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 pb-[calc(4rem+env(safe-area-inset-bottom))]">
                <Textarea 
                  placeholder="Cosa succede nel Distretto?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[100px] bg-transparent border-none text-lg font-bold uppercase italic tracking-tight p-0 focus-visible:ring-0 placeholder:text-zinc-800 resize-none text-white"
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

                {previewUrl && (
                  <div className="relative aspect-video bg-white/5 overflow-hidden border border-white/5 rounded-[1.5rem]">
                    {previewUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                      <video src={previewUrl} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    )}
                    <button 
                      type="button" onClick={handleRemoveImage}
                      className="absolute top-4 right-4 p-2 bg-black text-white hover:bg-red-600 transition-colors rounded-full border border-white/10"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex gap-4">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-12 h-12 bg-white/5 border border-white/10 text-zinc-400 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10 transition-all shrink-0"><Camera size={20} /></button>
                    <button 
                      type="button" onClick={() => setIsMusicSelectorOpen(true)} 
                      className={cn(
                        "w-12 h-12 border rounded-full flex items-center justify-center transition-all shrink-0",
                        selectedMusic ? "bg-white border-white text-black" : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                      )}
                    >
                      <Music size={20} />
                    </button>
                  </div>

                  <Button 
                    type="submit" disabled={updatePost.isPending}
                    className="bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] px-10 h-12 rounded-full font-black uppercase italic tracking-widest transition-all duration-300 shadow-xl border-none"
                  >
                    {updatePost.isPending ? <Loader2 className="animate-spin" /> : 'Salva Modifiche'}
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

export default EditPostModal;