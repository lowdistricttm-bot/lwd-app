"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Camera, Film, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useSocialFeed } from '@/hooks/use-social-feed';
import { showError } from '@/utils/toast';

const CreatePostModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { createPost } = useSocialFeed();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;
    
    try {
      await createPost.mutateAsync({ content, file: selectedFile || undefined });
      setContent('');
      removeFile();
      onClose();
    } catch (error: any) {
      showError("Errore durante la pubblicazione");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150]" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-x-0 bottom-0 z-[151] bg-zinc-950 border-t border-white/10 p-6 pb-12 rounded-t-[2rem] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black italic uppercase tracking-tighter">Nuovo Post</h2>
              <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Textarea 
                placeholder="Cosa succede nel District?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] bg-transparent border-none text-lg p-0 focus-visible:ring-0 placeholder:text-zinc-800 resize-none font-medium"
                autoFocus
              />

              {previewUrl && (
                <div className="relative aspect-video bg-zinc-900 overflow-hidden border border-white/5">
                  {selectedFile?.type.startsWith('video') ? <video src={previewUrl} className="w-full h-full object-cover" controls /> : <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />}
                  <button type="button" onClick={removeFile} className="absolute top-4 right-4 p-2 bg-black/60 text-white hover:bg-zinc-800 transition-colors"><Trash2 size={18} /></button>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex gap-4">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"><Camera size={20} /></button>
                </div>
                <Button type="submit" disabled={(!content.trim() && !selectedFile) || createPost.isPending} className="bg-white text-black hover:bg-zinc-200 px-8 py-6 rounded-none font-black uppercase italic tracking-widest">
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