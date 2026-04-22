"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Crown, Zap, Award, Star, ShieldCheck, Loader2, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useTrophies } from '@/hooks/use-trophies';
import { useBodyLock } from '@/hooks/use-body-lock';
import { cn } from '@/lib/utils';

interface AwardTrophyModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  vehicleName: string;
}

const TROPHY_OPTIONS = [
  { id: 'best_of_show', label: 'Best of Show', icon: Crown, color: 'text-yellow-400' },
  { id: 'best_fitment', label: 'Best Fitment', icon: Zap, color: 'text-blue-400' },
  { id: 'best_static', label: 'Best Static', icon: Award, color: 'text-red-500' },
  { id: 'best_air', label: 'Best Air', icon: Award, color: 'text-cyan-400' },
  { id: 'top_10', label: 'Top 10 Selection', icon: Star, color: 'text-emerald-400' },
  { id: 'staff_pick', label: 'Staff Pick', icon: ShieldCheck, color: 'text-purple-400' },
];

const AwardTrophyModal = ({ isOpen, onClose, vehicleId, vehicleName }: AwardTrophyModalProps) => {
  const { awardTrophy } = useTrophies(vehicleId);
  const [selectedType, setSelectedType] = useState('best_of_show');
  const [eventName, setEventName] = useState('LOW DISTRICT SEASON 4');

  useBodyLock(isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) return;
    await awardTrophy.mutateAsync({ vehicleId, type: selectedType, eventName: eventName.toUpperCase() });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] touch-none" />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[501] bg-zinc-950 border-t border-white/10 p-6 rounded-t-[2.5rem] max-h-[90dvh] overflow-y-auto shadow-2xl"
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
            
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 pb-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Assegna Trofeo</h2>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-1">Premia il progetto: {vehicleName}</p>
                </div>
                <button type="button" onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Seleziona Categoria</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {TROPHY_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedType(opt.id)}
                        className={cn(
                          "p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all duration-500",
                          selectedType === opt.id 
                            ? "bg-white text-black border-white shadow-xl scale-105" 
                            : "bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10"
                        )}
                      >
                        <opt.icon size={24} className={cn(selectedType === opt.id ? "text-black" : opt.color)} />
                        <span className="text-[8px] font-black uppercase tracking-widest text-center">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-zinc-500 ml-4">Nome Evento</Label>
                  <Input 
                    required 
                    value={eventName} 
                    onChange={e => setEventName(e.target.value)} 
                    className="bg-white/5 border-white/10 rounded-full h-14 px-6 font-bold text-xs tracking-widest"
                    placeholder="ES: LOW DISTRICT SEASON 4"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={awardTrophy.isPending}
                  className="w-full bg-white text-black hover:bg-zinc-200 h-16 rounded-full font-black uppercase italic tracking-[0.2em] transition-all duration-500 shadow-2xl mt-4"
                >
                  {awardTrophy.isPending ? <Loader2 className="animate-spin" /> : <><Trophy size={18} className="mr-2" /> Conferma Premiazione</>}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AwardTrophyModal;