"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Camera, Trash2, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useSocialFeed } from '@/hooks/use-social-feed';
import { showError } from '@/utils/toast';

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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[1000]" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-x-0 bottom-0 z-[1001] bg-zinc-950 border-t border-white/10 p-6 pb-12 rounded-t-[2rem] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black italic uppercase tracking-tighter">Nuovo Post</h2>
              <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pb-24">
              <Textarea 
                placeholder="Cosa succede nel District?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] bg-transparent border-none text-lg p-0 focus-visible:ring-0 placeholder:text-zinc-800 resize-none font-medium"
                autoFocus
              />

              {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {previews.map((url, i) => (
                    <div key={i} className="relative aspect-square bg-zinc-900 overflow-hidden border border-white/5">
                      <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeFile(i)} className="absolute top-2 right-2 p-1.5 bg-black/60 text-white hover:bg-zinc-800 transition-colors rounded-full"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  {previews.length < 10 && (
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-zinc-800 flex items-center justify-center text-zinc-600 hover:border-white hover:text-white transition-all"
                    >
                      <Plus size={24} />
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex gap-4">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"><Camera size={20} /></button>
                </div>
                <Button 
                  type="submit" 
                  disabled={(!content.trim() && selectedFiles.length === 0) || createPost.isPending} 
                  className="bg-white/90 backdrop-blur-md text-black hover:bg-white hover:scale-[1.02] active:scale-[0.98] px-8 py-6 rounded-none font-black uppercase italic tracking-widest transition-all duration-300 shadow-xl shadow-white/5"
                >
                  {createPost.isPending ? <Loader2 className="animate-spin" /> : <>Pubblica <Send size={16} className="ml-2" /></>}
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