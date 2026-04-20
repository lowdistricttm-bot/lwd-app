"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Camera, Loader2, Send, Type, AlignLeft, Navigation } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useMeets } from '@/hooks/use-meets';
import { useBodyLock } from '@/hooks/use-body-lock';
import { cn } from '@/lib/utils';
import { showLoading, dismissToast, showError } from '@/utils/toast';

interface CreateMeetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateMeetModal = ({ isOpen, onClose }: CreateMeetModalProps) => {
  const { createMeet } = useMeets();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: ''
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useBodyLock(isOpen);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleGetLocation = () => {
    if (!("geolocation" in navigator)) {
      showError("Geolocalizzazione non supportata.");
      return;
    }

    setIsLocating(true);
    const toastId = showLoading("Rilevamento posizione...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`
          );
          const data = await response.json();
          
          // Costruiamo un indirizzo leggibile
          const city = data.address.city || data.address.town || data.address.village || data.address.county;
          const road = data.address.road;
          const locationString = road ? `${road}, ${city}` : city;
          
          if (locationString) {
            setFormData(prev => ({ ...prev, location: locationString.toUpperCase() }));
            if ('vibrate' in navigator) navigator.vibrate(15);
          }
        } catch (err) {
          showError("Impossibile identificare il luogo.");
        } finally {
          setIsLocating(false);
          dismissToast(toastId);
        }
      },
      () => {
        setIsLocating(false);
        dismissToast(toastId);
        showError("Permesso negato o errore GPS.");
      }
    );
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
            className="fixed inset-x-0 bottom-0 z-[201] bg-zinc-950 border-t border-white/10 p-6 rounded-t-[2.5rem] max-h-[90dvh] overflow-y-auto shadow-2xl"
            style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
            
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 pb-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Organizza Incontro</h2>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-1">Crea un incontro per la community</p>
                </div>
                <button type="button" onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Titolo Incontro</Label>
                  <div className="relative">
                    <Type className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                    <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value.toUpperCase()})} className={cn(inputClass, "pl-12")} placeholder="ES: COFFEE & CARS MILANO" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Data e Ora</Label>
                    <div className="relative">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                      <Input required type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className={cn(inputClass, "pl-12")} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Luogo / Ritrovo</Label>
                    <div className="relative">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                      <Input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value.toUpperCase()})} className={cn(inputClass, "pl-12 pr-12")} placeholder="ES: PARCHEGGIO IKEA" />
                      <button 
                        type="button"
                        onClick={handleGetLocation}
                        disabled={isLocating}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                      >
                        {isLocating ? <Loader2 className="animate-spin" size={16} /> : <Navigation size={16} />}
                      </button>
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
                  className="w-full bg-white text-black hover:bg-zinc-200 h-16 rounded-full font-black uppercase italic tracking-[0.2em] transition-all duration-500 shadow-2xl mt-4"
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