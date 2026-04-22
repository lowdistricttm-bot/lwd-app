"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Camera, Loader2, Send, Type, Lock, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useMeets, Meet } from '@/hooks/use-meets';
import { useBodyLock } from '@/hooks/use-body-lock';
import { cn } from '@/lib/utils';

interface CreateMeetModalProps {
  isOpen: boolean;
  onClose: (meetCreated?: Meet) => void;
}

const CreateMeetModal = ({ isOpen, onClose }: CreateMeetModalProps) => {
  const { createMeet } = useMeets();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
    privacy: 'public' as 'public' | 'private'
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
    
    let finalLat = formData.latitude;
    let finalLng = formData.longitude;

    if (!finalLat && formData.location) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}&limit=1`);
        const data = await res.json();
        if (data[0]) {
          finalLat = parseFloat(data[0].lat);
          finalLng = parseFloat(data[0].lon);
        }
      } catch (err) {
        console.warn("[Meets] Impossibile geolocalizzare la stringa:", formData.location);
      }
    }

    const isoDate = formData.date ? new Date(formData.date).toISOString() : null;

    if (!isoDate) {
      alert("Seleziona una data valida.");
      return;
    }

    try {
      const newMeet = await createMeet.mutateAsync({ 
        ...formData, 
        date: isoDate,
        latitude: finalLat,
        longitude: finalLng,
        file: selectedFile 
      });
      
      // Passa il meet creato al componente padre per poterlo aprire subito
      onClose(newMeet as any);
    } catch (error) {
      console.error(error);
    }
  };

  const inputClass = "bg-white/5 border-white/10 rounded-full h-14 px-6 font-bold text-xs tracking-widest focus-visible:ring-white/20 transition-all placeholder:text-zinc-700 w-full max-w-full text-white";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => onClose()} className="fixed inset-0 bg-black/80 z-[200] touch-none" />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[201] bg-black border-t border-white/10 p-6 rounded-t-[2.5rem] h-[100dvh] overflow-y-auto shadow-2xl"
            style={{ 
              touchAction: 'pan-y', 
              overscrollBehavior: 'contain',
              paddingTop: 'calc(2rem + env(safe-area-inset-top))'
            }}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
            
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 pb-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Organizza Incontro</h2>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-1">Crea un incontro per la community</p>
                </div>
                <button type="button" onClick={() => onClose()} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Titolo Incontro</Label>
                  <div className="relative">
                    <Type className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={16} />
                    <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value.toUpperCase()})} className={cn(inputClass, "pl-12")} placeholder="ES: COFFEE & CARS MILANO" />
                  </div>
                </div>

                {/* Switch Privacy */}
                <div className="space-y-3">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Modalità Privacy</Label>
                  <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, privacy: 'public'})}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[10px] font-black uppercase italic transition-all",
                        formData.privacy === 'public' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      <Globe size={14} /> Pubblico
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, privacy: 'private'})}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[10px] font-black uppercase italic transition-all",
                        formData.privacy === 'private' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      <Lock size={14} /> Privato
                    </button>
                  </div>
                  {formData.privacy === 'private' && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-4 leading-relaxed mt-2"
                    >
                      L'incontro sarà invisibile sulla mappa. Solo chi riceverà il link d'invito potrà vedere i dettagli e partecipare. Perfetto per incontri segreti!
                    </motion.p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Data e Ora</Label>
                    <div className="relative overflow-hidden">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={16} />
                      <Input required type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className={cn(inputClass, "pl-12")} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Ritrovo</Label>
                    <div className="relative">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={16} />
                      <Input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value.toUpperCase()})} className={cn(inputClass, "pl-12")} placeholder="ES: MILANO (PARCHEGGIO IKEA)" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Locandina (Opzionale)</Label>
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
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Dettagli e Programma</Label>
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                    <Textarea 
                      required 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                      placeholder="Descrivi l'incontro..."
                      className="bg-transparent border-none focus-visible:ring-0 p-0 min-h-[120px] text-sm italic text-white placeholder:text-zinc-800 resize-none" 
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={createMeet.isPending}
                  className="w-full bg-white text-black hover:bg-zinc-200 h-16 rounded-full font-black uppercase italic tracking-[0.2em] transition-all duration-500 shadow-2xl mt-4 border-none"
                >
                  {createMeet.isPending ? <Loader2 className="animate-spin" /> : <><Send size={18} className="mr-2 -rotate-12" /> Pubblica Incontro</>}
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