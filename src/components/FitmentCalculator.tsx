"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Info, Gauge, MoveHorizontal, Plus, Zap, AlertTriangle, Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';

const FitmentCalculator = () => {
  // Setup Iniziale (OEM o Attuale)
  const [current, setCurrent] = useState({ 
    width: 8.5, 
    et: 35, 
    diameter: 18,
    tireW: 225,
    tireA: 40,
    spacer: 0
  });

  // Setup Desiderato (Nuovo)
  const [next, setNext] = useState({ 
    width: 9.5, 
    et: 22, 
    diameter: 19,
    tireW: 235,
    tireA: 35,
    spacer: 12
  });

  const calc = (data: typeof current) => {
    const rimWidthMm = data.width * 25.4;
    const tireSidewall = data.tireW * (data.tireA / 100);
    const totalDiameter = (data.diameter * 25.4) + (tireSidewall * 2);
    const poke = (rimWidthMm / 2) - data.et + data.spacer;
    const inset = (rimWidthMm / 2) + data.et - data.spacer;
    return { totalDiameter, poke, inset, circumference: totalDiameter * Math.PI };
  };

  const results = useMemo(() => {
    const c = calc(current);
    const n = calc(next);

    const speedoDiff = ((n.circumference - c.circumference) / c.circumference) * 100;
    
    return {
      pokeDiff: (n.poke - c.poke).toFixed(1),
      insetDiff: (n.inset - c.inset).toFixed(1),
      diameterDiff: (n.totalDiameter - c.totalDiameter).toFixed(1),
      speedoDiff: speedoDiff.toFixed(2),
      actualSpeed: (100 + (100 * (speedoDiff / 100))).toFixed(1)
    };
  }, [current, next]);

  const pokeVal = parseFloat(results.pokeDiff);
  const insetVal = parseFloat(results.insetDiff);
  const diamVal = parseFloat(results.diameterDiff);

  return (
    <div className="space-y-12">
      {/* Visual Simulation */}
      <div className="relative h-96 bg-zinc-950 rounded-[3rem] border border-white/5 overflow-hidden flex items-center justify-center shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        
        {/* Fender Line */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-64 h-1.5 bg-white/20 rounded-full z-10">
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest text-zinc-600">Linea Passaruota</div>
        </div>

        <div className="relative w-full flex justify-center items-center">
          {/* Current Wheel Outline */}
          <div 
            className="absolute border-2 border-dashed border-white/5 rounded-[2rem] flex items-center justify-center opacity-20"
            style={{ 
              width: current.width * 12 + 40,
              height: 280,
              x: -(current.et - current.spacer) / 2
            }}
          >
            <span className="text-[8px] font-black uppercase text-zinc-500 rotate-90">ORIGINALE</span>
          </div>

          {/* New Wheel & Tire Simulation */}
          <motion.div 
            animate={{ 
              x: -(next.et - next.spacer) / 2,
              width: next.width * 12 + 40,
              scale: 1
            }}
            className="relative h-[300px] bg-white/5 border border-white/20 rounded-[2.5rem] flex flex-col items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.05)]"
          >
            {/* Tire Part */}
            <div className="absolute inset-0 border-[12px] border-zinc-900 rounded-[2.5rem]" />
            
            {/* Rim Part */}
            <div className="relative z-10 flex flex-col items-center bg-white text-black p-4 rounded-2xl shadow-2xl">
              <span className="text-xs font-black italic leading-none">{next.diameter}"</span>
              <span className="text-[8px] font-bold opacity-60">{next.width}J ET{next.et}</span>
              {next.spacer > 0 && <span className="text-[7px] font-black text-red-600 mt-1">+{next.spacer}mm Spacer</span>}
            </div>

            {/* Indicators */}
            <div className="absolute -bottom-12 flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <MoveHorizontal size={12} className={cn(pokeVal > 0 ? "text-green-400" : "text-red-400")} />
                <span className="text-lg font-black italic">{Math.abs(pokeVal)}mm</span>
              </div>
              <span className="text-[7px] font-black uppercase tracking-widest text-zinc-500">
                {pokeVal > 0 ? 'Più Sporgente' : 'Più Rientrante'}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Setup Card */}
        <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem] space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500"><Gauge size={20} /></div>
            <h4 className="text-xs font-black uppercase tracking-widest italic">Setup Attuale</h4>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-500 ml-4">Diametro</Label>
              <Input type="number" value={current.diameter} onChange={e => setCurrent({...current, diameter: parseFloat(e.target.value) || 0})} className="bg-black/40 border-white/10 rounded-full h-12 text-center font-black italic" />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-500 ml-4">Canale (J)</Label>
              <Input type="number" step="0.5" value={current.width} onChange={e => setCurrent({...current, width: parseFloat(e.target.value) || 0})} className="bg-black/40 border-white/10 rounded-full h-12 text-center font-black italic" />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-500 ml-4">Offset (ET)</Label>
              <Input type="number" value={current.et} onChange={e => setCurrent({...current, et: parseFloat(e.target.value) || 0})} className="bg-black/40 border-white/10 rounded-full h-12 text-center font-black italic" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-500 ml-4">Gomma (Larghezza)</Label>
              <Input type="number" value={current.tireW} onChange={e => setCurrent({...current, tireW: parseFloat(e.target.value) || 0})} className="bg-black/40 border-white/10 rounded-full h-12 text-center font-black italic" />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-500 ml-4">Gomma (Spalla)</Label>
              <Input type="number" value={current.tireA} onChange={e => setCurrent({...current, tireA: parseFloat(e.target.value) || 0})} className="bg-black/40 border-white/10 rounded-full h-12 text-center font-black italic" />
            </div>
          </div>
        </div>

        {/* Next Setup Card */}
        <div className="bg-white text-black p-8 rounded-[2.5rem] shadow-2xl space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center text-white"><Plus size={20} /></div>
            <h4 className="text-xs font-black uppercase tracking-widest italic">Nuovo Setup</h4>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-700 ml-4">Diametro</Label>
              <Input type="number" value={next.diameter} onChange={e => setNext({...next, diameter: parseFloat(e.target.value) || 0})} className="bg-white border-black/10 rounded-full h-12 text-center font-black italic focus-visible:ring-black/20" />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-700 ml-4">Canale (J)</Label>
              <Input type="number" step="0.5" value={next.width} onChange={e => setNext({...next, width: parseFloat(e.target.value) || 0})} className="bg-white border-black/10 rounded-full h-12 text-center font-black italic focus-visible:ring-black/20" />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-700 ml-4">Offset (ET)</Label>
              <Input type="number" value={next.et} onChange={e => setNext({...next, et: parseFloat(e.target.value) || 0})} className="bg-white border-black/10 rounded-full h-12 text-center font-black italic focus-visible:ring-black/20" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-black/5">
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-700 ml-4">Gomma (L)</Label>
              <Input type="number" value={next.tireW} onChange={e => setNext({...next, tireW: parseFloat(e.target.value) || 0})} className="bg-white border-black/10 rounded-full h-12 text-center font-black italic focus-visible:ring-black/20" />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-700 ml-4">Gomma (S)</Label>
              <Input type="number" value={next.tireA} onChange={e => setNext({...next, tireA: parseFloat(e.target.value) || 0})} className="bg-white border-black/10 rounded-full h-12 text-center font-black italic focus-visible:ring-black/20" />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-red-600 ml-4">Distanziale</Label>
              <Input type="number" value={next.spacer} onChange={e => setNext({...next, spacer: parseFloat(e.target.value) || 0})} className="bg-red-50 border-red-200 rounded-full h-12 text-center font-black italic text-red-600 focus-visible:ring-red-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 italic mb-4">Assetto Esterno</p>
          <div className="flex items-baseline gap-2">
            <span className={cn("text-5xl font-black italic tracking-tighter", pokeVal > 0 ? "text-white" : "text-zinc-600")}>
              {pokeVal > 0 ? `+${pokeVal}` : pokeVal} <span className="text-sm">mm</span>
            </span>
          </div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase mt-4 leading-tight">Sporgenza totale calcolata inclusi distanziali.</p>
        </div>

        <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 italic mb-4">Diametro Totale</p>
          <div className="flex items-baseline gap-2">
            <span className={cn("text-5xl font-black italic tracking-tighter", Math.abs(diamVal) > 10 ? "text-orange-500" : "text-white")}>
              {diamVal > 0 ? `+${diamVal}` : diamVal} <span className="text-sm">mm</span>
            </span>
          </div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase mt-4 leading-tight">Variazione dell'altezza totale della ruota finita.</p>
        </div>

        <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 italic mb-4">Errore Tachimetro</p>
          <div className="flex items-baseline gap-2">
            <span className={cn("text-5xl font-black italic tracking-tighter", Math.abs(parseFloat(results.speedoDiff)) > 3 ? "text-red-500" : "text-green-400")}>
              {results.speedoDiff}%
            </span>
          </div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase mt-4 leading-tight">
            A 100 km/h indicati, la velocità reale sarà di <span className="text-white">{results.actualSpeed} km/h</span>.
          </p>
        </div>
      </div>

      {Math.abs(parseFloat(results.speedoDiff)) > 3 && (
        <div className="flex items-center gap-4 bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem]">
          <AlertTriangle className="text-red-500 shrink-0" size={24} />
          <p className="text-[10px] font-black uppercase text-red-500 leading-relaxed italic">
            Attenzione: La differenza di diametro supera il 3%. Questo potrebbe causare problemi ai sistemi ABS/ESP e rendere il veicolo non conforme alle normative stradali.
          </p>
        </div>
      )}
    </div>
  );
};

export default FitmentCalculator;