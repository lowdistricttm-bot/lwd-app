"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2, Calendar, MapPin, Type, AlignLeft, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useMeets } from '@/hooks/use-meets';
import { useBodyLock } from '@/hooks/use-body-lock';
import { cn } from '@/lib/utils';

interface CreateMeetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateMeetModal = ({ isOpen, onClose }: CreateMeetModalProps) => {
  const { createMeet } = useMeets();
  const fileInputRef = useRef<HTMLInputElement>(null);
  useBodyLock(isOpen);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMeet.mutateAsync({ ...formData, file: selectedFile });
    onClose();
  };

  const inputClass = "bg-white/5 border-white/10 rounded-full h-14 px-6 font-bold text-xs tracking-widest focus-visible:ring-white/20 transition-all placeholder:text-zinc-700";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] touch-none" />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[201] bg-black/60 backdrop-blur-2xl border-t border-white/10 p-6 rounded-t-[2.5rem] max-h-[90dvh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
            
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 pb-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Organizza Meet</h2>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-1">Crea un raduno per la community</p>
                </div>
                <button type="button" onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Titolo Raduno</Label>
                  <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value.toUpperCase()})} className={inputClass} placeholder="ES: COFFEE & CARS MILANO" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Data e Ora</Label>
                    <Input required type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Luogo</Label>
                    <Input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value.toUpperCase()})} className={inputClass} placeholder="ES: PARCHEGGIO IKEA" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Locandina (Opzionale)</Label>
                  <div onClick={() => fileInputRef.current?.click()} className="aspect-video border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-white/30 transition-all bg-white/5 overflow-hidden relative group">
                    {previewUrl ? (
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <>
                        <Camera size={24} className="text-zinc-500 mb-2" />
                        <span className="text-[10px] font-black uppercase text-zinc-500">Carica Immagine</span>
                      </>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Descrizione</Label>
                  <Textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Dettagli sul raduno..." className="bg-white/5 border-white/10 rounded-[1.5rem] min-h-[100px] p-6 text-sm italic" />
                </div>

                <Button type="submit" disabled={createMeet.isPending} className="w-full bg-white text-black rounded-full h-16 font-black uppercase italic tracking-widest shadow-2xl">
                  {createMeet.isPending ? <Loader2 className="animate-spin" /> : <><Save size={18} className="mr-2" /> Pubblica Meet</>}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateMeetModal;