"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Info, ArrowRightLeft, ChevronRight, Gauge, MoveHorizontal, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const FitmentCalculator = () => {
  const [current, setCurrent] = useState({ width: 8.5, et: 35 });
  const [next, setNext] = useState({ width: 9.5, et: 22 });

  const results = useMemo(() => {
    const currentPoke = (current.width * 25.4) / 2 - current.et;
    const nextPoke = (next.width * 25.4) / 2 - next.et;
    
    const currentInset = (current.width * 25.4) / 2 + current.et;
    const nextInset = (next.width * 25.4) / 2 + next.et;

    return {
      poke: (nextPoke - currentPoke).toFixed(1),
      inset: (nextInset - currentInset).toFixed(1)
    };
  }, [current, next]);

  const pokeVal = parseFloat(results.poke);
  const insetVal = parseFloat(results.inset);

  return (
    <div className="space-y-10">
      {/* Visual Comparison */}
      <div className="relative h-64 bg-zinc-950 rounded-[2.5rem] border border-white/5 overflow-hidden flex items-center justify-center shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        
        {/* Fender Line */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/20 rounded-full z-10">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest text-zinc-600">Passaruota</div>
        </div>

        <div className="relative w-full flex justify-center items-center gap-12">
          {/* Current Wheel (Ghost) */}
          <motion.div 
            className="absolute w-32 h-40 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center"
            style={{ x: -current.et / 2 }}
          >
            <span className="text-[7px] font-black uppercase text-zinc-700 rotate-90">OEM SETUP</span>
          </motion.div>

          {/* New Wheel (Solid) */}
          <motion.div 
            animate={{ 
              x: -next.et / 2,
              width: next.width * 15,
              scale: 1
            }}
            className="relative h-44 bg-white text-black rounded-xl flex flex-col items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)] border border-white/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white via-zinc-200 to-zinc-400 rounded-xl" />
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-[9px] font-black italic leading-none">{next.width}J</span>
              <span className="text-[7px] font-bold opacity-60">ET{next.et}</span>
            </div>
            
            {/* Poke Indicator */}
            {pokeVal !== 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "absolute -bottom-8 flex flex-col items-center",
                  pokeVal > 0 ? "text-green-400" : "text-red-400"
                )}
              >
                <div className="flex items-center gap-1">
                  <MoveHorizontal size={10} />
                  <span className="text-[10px] font-black italic">{Math.abs(pokeVal)}mm</span>
                </div>
                <span className="text-[6px] font-black uppercase tracking-widest">
                  {pokeVal > 0 ? 'Più Sporgente' : 'Più Rientrante'}
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Current Setup */}
        <div className="space-y-6 p-8 bg-white/5 backdrop-blur-md border border-white/5 rounded-[2rem]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500">
              <Gauge size={16} />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-widest italic">Cerchio Attuale</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-500 ml-4">Canale (J)</Label>
              <Input 
                type="number" 
                step="0.5"
                value={current.width} 
                onChange={e => setCurrent({...current, width: parseFloat(e.target.value) || 0})}
                className="bg-black/40 border-white/10 rounded-full h-12 px-6 font-black italic"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-500 ml-4">Offset (ET)</Label>
              <Input 
                type="number" 
                value={current.et} 
                onChange={e => setCurrent({...current, et: parseFloat(e.target.value) || 0})}
                className="bg-black/40 border-white/10 rounded-full h-12 px-6 font-black italic"
              />
            </div>
          </div>
        </div>

        {/* New Setup */}
        <div className="space-y-6 p-8 bg-white text-black rounded-[2rem] shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center text-white">
              <Plus size={16} />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-widest italic">Nuovo Cerchio</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-700 ml-4">Canale (J)</Label>
              <Input 
                type="number" 
                step="0.5"
                value={next.width} 
                onChange={e => setNext({...next, width: parseFloat(e.target.value) || 0})}
                className="bg-white border-black/10 rounded-full h-12 px-6 font-black italic focus-visible:ring-black/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-700 ml-4">Offset (ET)</Label>
              <Input 
                type="number" 
                value={next.et} 
                onChange={e => setNext({...next, et: parseFloat(e.target.value) || 0})}
                className="bg-white border-black/10 rounded-full h-12 px-6 font-black italic focus-visible:ring-black/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <ArrowRightLeft size={120} />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Esterno (Poke)</p>
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-4xl font-black italic tracking-tighter",
                pokeVal > 0 ? "text-white" : "text-zinc-500"
              )}>
                {pokeVal > 0 ? `+${pokeVal}` : pokeVal} <span className="text-sm">mm</span>
              </span>
            </div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase leading-tight">
              {pokeVal > 0 
                ? `Il cerchio sporgerà di ${pokeVal}mm in più verso l'esterno.` 
                : pokeVal < 0 
                ? `Il cerchio rientrerà di ${Math.abs(pokeVal)}mm verso l'interno.`
                : "Nessun cambiamento sulla sporgenza esterna."}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Interno (Clearance)</p>
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-4xl font-black italic tracking-tighter",
                insetVal > 0 ? "text-red-400" : "text-zinc-500"
              )}>
                {insetVal > 0 ? `+${insetVal}` : insetVal} <span className="text-sm">mm</span>
              </span>
            </div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase leading-tight">
              {insetVal > 0 
                ? `Perderai ${insetVal}mm di spazio interno verso l'ammortizzatore.` 
                : insetVal < 0 
                ? `Guadagnerai ${Math.abs(insetVal)}mm di spazio interno.`
                : "Nessun cambiamento nell'ingombro interno."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-4 bg-white/5 p-6 rounded-2xl border border-white/5">
        <Info size={20} className="text-zinc-500 shrink-0" />
        <p className="text-[9px] font-bold uppercase text-zinc-500 leading-relaxed italic">
          Nota: I calcoli si basano puramente sulle dimensioni del cerchio. Non tengono conto della forma delle razze (spazio pinze), del camber o della spalla dello pneumatico. Verifica sempre gli ingombri fisici prima dell'acquisto.
        </p>
      </div>
    </div>
  );
};

export default FitmentCalculator;