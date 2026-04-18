"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Camera, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useSocialFeed } from '@/hooks/use-social-feed';
import { showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const CreatePostModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { createPost } = useSocialFeed();

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
      await createPost.mutateAsync({ content, files: selectedFiles });
      setContent('');
      setSelectedFiles([]);
      setPreviews([]);
      onClose();
    } catch (error: any) {
      showError("Errore durante la pubblicazione");
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]" 
          />
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[1001] bg-black/60 backdrop-blur-2xl border-t border-white/10 p-6 pb-12 rounded-t-[2.5rem] max-h-[85vh] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            {/* Handle per il drag visivo */}
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />

            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Nuovo Post</h2>
                <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mt-1">Condividi con il District</p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6 overflow-y-auto no-scrollbar pb-24">
              <Textarea 
                placeholder="Cosa succede nel District?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] bg-transparent border-none text-lg p-0 focus-visible:ring-0 placeholder:text-zinc-800 resize-none font-medium italic text-white"
                autoFocus
              />

              {previews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {previews.map((url, i) => (
                    <div key={i} className="relative aspect-square bg-black/40 rounded-[1.5rem] overflow-hidden border border-white/5 group">
                      <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeFile(i)} 
                        className="absolute top-2 right-2 p-2 bg-black/60 text-white hover:bg-red-600 transition-all rounded-full backdrop-blur-md"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {previews.length < 10 && (
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-white/5 bg-white/5 rounded-[1.5rem] flex flex-col items-center justify-center text-zinc-600 hover:border-white/20 hover:text-white transition-all group"
                    >
                      <Plus size={24} className="mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Aggiungi</span>
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                <div className="flex gap-3">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*,video/*" 
                    multiple 
                    onChange={handleFileChange} 
                  />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-12 h-12 bg-white/5 border border-white/10 text-zinc-400 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10 transition-all shrink-0 backdrop-blur-md"
                  >
                    <Camera size={20} />
                  </button>
                </div>

                <Button 
                  type="submit" 
                  disabled={(!content.trim() && selectedFiles.length === 0) || createPost.isPending} 
                  className="bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] px-10 h-12 rounded-full font-black uppercase italic tracking-widest transition-all duration-300 shadow-xl shadow-white/5 border-none"
                >
                  {createPost.isPending ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <span className="flex items-center gap-2">Pubblica <Send size={16} className="-rotate-12" /></span>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;