"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2, Calendar as CalendarIcon, MapPin, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useEvents, Event } from '@/hooks/use-events';

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200]" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-x-0 bottom-0 z-[201] bg-zinc-950 border-t border-white/10 p-8 rounded-t-[2rem] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                  {event ? 'Modifica Evento' : 'Nuovo Evento'}
                </h2>
                <button type="button" onClick={onClose} className="p-2 text-zinc-500 hover:text-white"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">Titolo Evento</Label>
                  <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-transparent border-zinc-800 rounded-none h-12" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-zinc-500">Data Inizio</Label>
                    <Input required type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-transparent border-zinc-800 rounded-none h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-zinc-500">Data Fine (Opzionale)</Label>
                    <Input type="datetime-local" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="bg-transparent border-zinc-800 rounded-none h-12" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">Luogo</Label>
                  <Input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="bg-transparent border-zinc-800 rounded-none h-12" />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">Locandina Evento</Label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center cursor-pointer hover:border-white transition-all bg-zinc-900/30 overflow-hidden relative"
                  >
                    {previewUrl ? (
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <>
                        <Camera size={32} className="text-zinc-700 mb-2" />
                        <span className="text-[10px] font-black uppercase text-zinc-500">Carica Locandina</span>
                      </>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">Descrizione Evento</Label>
                  <Textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-transparent border-zinc-800 rounded-none min-h-[100px]" />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">Programma</Label>
                  <Textarea value={formData.program} onChange={e => setFormData({...formData, program: e.target.value})} className="bg-transparent border-zinc-800 rounded-none min-h-[150px]" />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">Stato Iscrizioni</Label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-transparent border border-zinc-800 rounded-none h-12 px-4 text-sm font-black uppercase italic"
                  >
                    <option value="open" className="bg-zinc-950">Aperte</option>
                    <option value="closed" className="bg-zinc-950">Chiuse</option>
                    <option value="soon" className="bg-zinc-950">In Arrivo</option>
                  </select>
                </div>

                <Button 
                  type="submit" 
                  disabled={createEvent.isPending || updateEvent.isPending}
                  className="w-full bg-white/90 backdrop-blur-md text-black py-8 font-black uppercase italic tracking-widest rounded-none hover:bg-white transition-all"
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