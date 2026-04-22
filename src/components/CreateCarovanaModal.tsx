"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Plus, Trash2, Loader2, Send, Type } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useCarovane } from '@/hooks/use-carovane';
import { useBodyLock } from '@/hooks/use-body-lock';
import { cn } from '@/lib/utils';

interface CreateCarovanaModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
}

const CreateCarovanaModal = ({ isOpen, onClose, eventId, eventTitle }: CreateCarovanaModalProps) => {
  const { createCarovana } = useCarovane();
  const [formData, setFormData] = useState({
    title: '',
    startLocation: '',
    startTime: '',
    routeDescription: ''
  });
  const [stops, setStops] = useState<{ location: string, arrivalTime: string }[]>([]);

  useBodyLock(isOpen);

  const addStop = () => setStops([...stops, { location: '', arrivalTime: '' }]);
  const removeStop = (index: number) => setStops(stops.filter((_, i) => i !== index));
  const updateStop = (index: number, field: string, value: string) => {
    const newStops = [...stops];
    (newStops[index] as any)[field] = value;
    setStops(newStops);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCarovana.mutateAsync({ ...formData, eventId, stops });
    onClose();
  };

  const inputClass = "w-full bg-white/5 border-white/10 rounded-full h-14 px-6 font-bold text-xs tracking-widest focus-visible:ring-white/20 transition-all placeholder:text-zinc-700";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] touch-none" 
          />
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 z-[1001] bg-zinc-950 border border-white/10 p-6 rounded-t-[2.5rem] max-h-[85dvh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
            style={{ 
              bottom: '56px', 
              touchAction: 'pan-y', 
              overscrollBehavior: 'contain'
            }}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
            
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 pb-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Crea Carovana</h2>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-1">Run to: {eventTitle}</p>
                </div>
                <button type="button" onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Titolo Carovana</Label>
                  <div className="relative">
                    <Type className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                    <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value.toUpperCase()})} className={cn(inputClass, "pl-12")} placeholder="ES: CREW MILANO SUD" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 min-w-0">
                    <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Punto di Partenza</Label>
                    <div className="relative">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                      <Input required value={formData.startLocation} onChange={e => setFormData({...formData, startLocation: e.target.value.toUpperCase()})} className={cn(inputClass, "pl-12")} placeholder="ES: IKEA CORSICO" />
                    </div>
                  </div>
                  <div className="space-y-2 min-w-0">
                    <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Orario Partenza</Label>
                    <div className="relative">
                      <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                      <Input required type="datetime-local" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className={cn(inputClass, "pl-12")} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-4">
                    <Label className="text-[9px] font-black uppercase text-zinc-500">Tappe Intermedie</Label>
                    <button type="button" onClick={addStop} className="text-[9px] font-black uppercase text-white bg-white/10 px-3 py-1 rounded-full hover:bg-white hover:text-black transition-all">Aggiungi</button>
                  </div>
                  
                  <div className="space-y-3">
                    {stops.map((stop, i) => (
                      <div key={i} className="flex gap-3 items-center animate-in slide-in-from-left-2">
                        <div className="flex-1 grid grid-cols-2 gap-2 min-w-0">
                          <Input placeholder="LUOGO" value={stop.location} onChange={e => updateStop(i, 'location', e.target.value.toUpperCase())} className="w-full bg-white/5 border-white/10 rounded-full h-10 px-4 text-[10px] font-bold" />
                          <Input type="datetime-local" value={stop.arrivalTime} onChange={e => updateStop(i, 'arrivalTime', e.target.value)} className="w-full bg-white/5 border-white/10 rounded-full h-10 px-4 text-[10px] font-bold" />
                        </div>
                        <button type="button" onClick={() => removeStop(i)} className="p-2 text-zinc-600 hover:text-red-500 shrink-0"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Descrizione Percorso</Label>
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                    <Textarea 
                      value={formData.routeDescription} 
                      onChange={e => setFormData({...formData, routeDescription: e.target.value})} 
                      placeholder="Dettagli sul percorso, andatura, frequenze radio..."
                      className="bg-transparent border-none focus-visible:ring-0 p-0 min-h-[100px] text-sm italic text-white placeholder:text-zinc-800 resize-none" 
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={createCarovana.isPending}
                  className="w-full bg-white text-black hover:bg-zinc-200 h-16 rounded-full font-black uppercase italic tracking-[0.2em] transition-all duration-500 shadow-2xl mt-4"
                >
                  {createCarovana.isPending ? <Loader2 className="animate-spin" /> : <><Send size={18} className="mr-2 -rotate-12" /> Crea Carovana</>}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateCarovanaModal;