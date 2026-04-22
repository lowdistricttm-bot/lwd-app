"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2, Save, Type, LayoutGrid, Link as LinkIcon, AlignLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useAcademy, Tutorial, ACADEMY_CATEGORIES } from '@/hooks/use-academy';
import { useBodyLock } from '@/hooks/use-body-lock';
import { cn } from '@/lib/utils';

interface CreateTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTutorial?: Tutorial | null;
}

const CreateTutorialModal = ({ isOpen, onClose, editTutorial }: CreateTutorialModalProps) => {
  const { createTutorial, updateTutorial } = useAcademy();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'mechanics',
    video_url: ''
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (editTutorial) {
      setFormData({
        title: editTutorial.title,
        content: editTutorial.content,
        category: editTutorial.category,
        video_url: editTutorial.video_url || ''
      });
      setPreviewUrl(editTutorial.image_url || null);
    } else {
      setFormData({ title: '', content: '', category: 'mechanics', video_url: '' });
      setPreviewUrl(null);
    }
    setSelectedFile(null);
  }, [editTutorial, isOpen]);

  useBodyLock(isOpen);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editTutorial) {
      await updateTutorial.mutateAsync({
        id: editTutorial.id,
        ...formData,
        file: selectedFile || undefined,
        existingImage: editTutorial.image_url
      });
    } else {
      await createTutorial.mutateAsync({
        ...formData,
        file: selectedFile || undefined
      });
    }
    onClose();
  };

  const inputClass = "bg-white/5 border-white/10 rounded-full h-14 px-6 font-bold text-xs tracking-widest focus-visible:ring-white/20 text-white";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 z-[1000] touch-none" />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[1001] bg-black border-t border-white/10 p-6 rounded-t-[2.5rem] max-h-[94dvh] overflow-y-auto shadow-2xl"
            style={{ touchAction: 'pan-y', overscrollBehavior: 'contain', paddingTop: 'calc(2rem + env(safe-area-inset-top))' }}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
            
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 pb-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                    {editTutorial ? 'Modifica Tutorial' : 'Nuovo Tutorial Low Academy'}
                  </h2>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-1">Condividi la tua conoscenza tecnica</p>
                </div>
                <button type="button" onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Titolo Tutorial</Label>
                  <div className="relative">
                    <Type className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                    <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={cn(inputClass, "pl-12")} placeholder="ES: COME ROLLARE I PARAFANGHI" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Categoria</Label>
                    <div className="relative">
                      <LayoutGrid className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                      <select 
                        value={formData.category} 
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className={cn(inputClass, "w-full pl-12 appearance-none bg-black")}
                      >
                        {ACADEMY_CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.label.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Link Video (YouTube/Vimeo)</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                      <Input value={formData.video_url} onChange={e => setFormData({...formData, video_url: e.target.value})} className={cn(inputClass, "pl-12")} placeholder="https://..." />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Immagine di Copertina</Label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all bg-white/5 overflow-hidden relative group"
                  >
                    {previewUrl ? (
                      <img src={previewUrl} className="w-full h-full object-cover opacity-80" alt="Preview" />
                    ) : (
                      <>
                        <Camera size={24} className="text-zinc-600 mb-2" />
                        <span className="text-[10px] font-black uppercase text-zinc-600">Carica Foto</span>
                      </>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Contenuto Tecnico</Label>
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                    <Textarea 
                      required 
                      value={formData.content} 
                      onChange={e => setFormData({...formData, content: e.target.value})} 
                      placeholder="Spiega passo dopo passo la procedura..."
                      className="bg-transparent border-none focus-visible:ring-0 p-0 min-h-[200px] text-sm italic text-white placeholder:text-zinc-800 resize-none" 
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={createTutorial.isPending || updateTutorial.isPending}
                  className="w-full bg-white text-black hover:bg-zinc-200 h-16 rounded-full font-black uppercase italic tracking-[0.2em] transition-all duration-500 shadow-2xl mt-4 border-none"
                >
                  {createTutorial.isPending || updateTutorial.isPending ? <Loader2 className="animate-spin" /> : <><Save size={18} className="mr-2" /> {editTutorial ? 'Salva Modifiche' : 'Pubblica Tutorial'}</>}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateTutorialModal;