"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2, Calendar as CalendarIcon, MapPin, Save, Plus, Type, AlignLeft, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useEvents, Event } from '@/hooks/use-events';
import { useBodyLock } from '@/hooks/use-body-lock';
import { cn } from '@/lib/utils';

interface EventAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
}

const EventAdminModal = ({ isOpen, onClose, event }: EventAdminModalProps) => {
  const { createEvent, updateEvent } = useEvents();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    program: '',
    date: '',
    end_date: '',
    location: '',
    status: 'open'
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Blocco background
  useBodyLock(isOpen);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        program: event.program || '',
        date: new Date(event.date).toISOString().slice(0, 16),
        end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
        location: event.location,
        status: event.status
      });
      setPreviewUrl(event.image_url || null);
    } else {
      setFormData({
        title: '',
        description: '',
        program: '',
        date: '',
        end_date: '',
        location: '',
        status: 'open'
      });
      setPreviewUrl(null);
    }
    setSelectedFile(null);
  }, [event, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { 
      ...formData, 
      id: event?.id, 
      file: selectedFile || undefined,
      end_date: formData.end_date || undefined
    };
    
    if (event) {
      await updateEvent.mutateAsync(payload);
    } else {
      await createEvent.mutateAsync(payload);
    }
    onClose();
  };

  const labelClass = "text-[9px] font-black uppercase text-zinc-500 tracking-[0.3em] italic ml-4 mb-2 block";
  const inputClass = "bg-white/5 border-white/10 rounded-full h-14 px-6 font-bold text-xs tracking-widest focus-visible:ring-white/20 transition-all placeholder:text-zinc-700 w-full max-w-full text-white";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="fixed inset-0 bg-black/80 z-[200] touch-none" 
          />
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[201] bg-black border-t border-white/10 p-6 rounded-t-[2.5rem] h-[100dvh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
            style={{ 
              touchAction: 'pan-y',
              overscrollBehavior: 'contain',
              paddingTop: 'calc(2rem + env(safe-area-inset-top))'
            }}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
            
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-10 pb-[calc(4rem+env(safe-area-inset-bottom))]">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                    {event ? 'Modifica Evento' : 'Nuovo Evento'}
                  </h2>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-1">Gestione District Calendar</p>
                </div>
                <button type="button" onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="space-y-8">
                {/* Titolo */}
                <div className="space-y-2">
                  <Label className={labelClass}>Titolo Evento</Label>
                  <div className="relative">
                    <Type className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={16} />
                    <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={cn(inputClass, "pl-12")} placeholder="ES: LOW DISTRICT SHOW 2026" />
                  </div>
                </div>

                {/* Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className={labelClass}>Data Inizio</Label>
                    <div className="relative overflow-hidden">
                      <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={16} />
                      <Input required type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className={cn(inputClass, "pl-12")} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClass}>Data Fine (Opzionale)</Label>
                    <div className="relative overflow-hidden">
                      <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={16} />
                      <Input type="datetime-local" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className={cn(inputClass, "pl-12")} />
                    </div>
                  </div>
                </div>

                {/* Luogo */}
                <div className="space-y-2">
                  <Label className={labelClass}>Luogo</Label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={16} />
                    <Input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className={cn(inputClass, "pl-12")} placeholder="ES: MILANO, ITALY" />
                  </div>
                </div>

                {/* Locandina */}
                <div className="space-y-2">
                  <Label className={labelClass}>Locandina Evento</Label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-white/30 transition-all bg-white/5 overflow-hidden relative group"
                  >
                    {previewUrl ? (
                      <>
                        <img src={previewUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Preview" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera size={32} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-white/10 transition-colors">
                          <Camera size={24} className="text-zinc-500" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Carica Locandina</span>
                      </>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                {/* Descrizione */}
                <div className="space-y-2">
                  <Label className={labelClass}>Descrizione Evento</Label>
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                    <Textarea 
                      required 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                      placeholder="Descrivi l'evento..."
                      className="bg-transparent border-none focus-visible:ring-0 p-0 min-h-[100px] text-sm italic text-white placeholder:text-zinc-800 resize-none" 
                    />
                  </div>
                </div>

                {/* Programma */}
                <div className="space-y-2">
                  <Label className={labelClass}>Programma</Label>
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                    <Textarea 
                      value={formData.program} 
                      onChange={e => setFormData({...formData, program: e.target.value})} 
                      placeholder="Inserisci il programma dettagliato..."
                      className="bg-transparent border-none focus-visible:ring-0 p-0 min-h-[150px] text-sm italic text-white placeholder:text-zinc-800 resize-none" 
                    />
                  </div>
                </div>

                {/* Stato */}
                <div className="space-y-2">
                  <Label className={labelClass}>Stato Iscrizioni</Label>
                  <div className="relative">
                    <Info className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={16} />
                    <select 
                      value={formData.status} 
                      onChange={e => setFormData({...formData, status: e.target.value})}
                      className={cn(inputClass, "w-full pl-12 appearance-none bg-black")}
                    >
                      <option value="open">ISCRIZIONI APERTE</option>
                      <option value="closed">ISCRIZIONI CHIUSE</option>
                      <option value="soon">IN ARRIVO</option>
                    </select>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={createEvent.isPending || updateEvent.isPending}
                  className="w-full bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] h-16 rounded-full font-black uppercase italic tracking-[0.2em] transition-all duration-500 shadow-2xl mt-4 border-none"
                >
                  {(createEvent.isPending || updateEvent.isPending) ? <Loader2 className="animate-spin" /> : <><Save size={18} className="mr-2" /> Salva Evento</>}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EventAdminModal;