"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Info, Gauge, MoveHorizontal, Plus, Zap, AlertTriangle, Ruler, Save, Car, Loader2, CheckCircle2, ArrowRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGarage } from '@/hooks/use-garage';
import { useVehicleLogs } from '@/hooks/use-vehicle-logs';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import { showSuccess, showError } from '@/utils/toast';

const FitmentCalculator = () => {
  const { user } = useAuth();
  const { vehicles } = useGarage();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  
  const [current, setCurrent] = useState({ 
    width: 8.5, et: 35, diameter: 18, tireW: 225, tireA: 40, spacer: 0
  });

  const [next, setNext] = useState({ 
    width: 9.5, et: 22, diameter: 19, tireW: 235, tireA: 35, spacer: 12
  });

  const { addLog } = useVehicleLogs(selectedVehicleId || undefined);

  useEffect(() => {
    if (vehicles && vehicles.length > 0 && !selectedVehicleId) {
      const main = vehicles.find(v => v.is_main) || vehicles[0];
      setSelectedVehicleId(main.id);
    }
  }, [vehicles, selectedVehicleId]);

  const calc = (data: typeof current) => {
    const rimWidthMm = data.width * 25.4;
    const tireSidewall = data.tireW * (data.tireA / 100);
    const totalDiameter = (data.diameter * 25.4) + (tireSidewall * 2);
    const poke = (rimWidthMm / 2) - data.et + data.spacer;
    const inset = (rimWidthMm / 2) + data.et - data.spacer;
    return { totalDiameter, poke, inset, rimWidthMm };
  };

  const results = useMemo(() => {
    const c = calc(current);
    const n = calc(next);
    return {
      pokeDiff: (n.poke - c.poke).toFixed(1),
      insetDiff: (n.inset - c.inset).toFixed(1),
      diameterDiff: (n.totalDiameter - c.totalDiameter).toFixed(1),
    };
  }, [current, next]);

  const pokeVal = parseFloat(results.pokeDiff);

  const handleSaveToGarage = async () => {
    if (!selectedVehicleId) { showError("Seleziona un veicolo"); return; }
    const logTitle = `FITMENT: ${next.width}J ET${next.et} (${next.tireW}/${next.tireA} R${next.diameter})`;
    const logDesc = `Configurazione calcolata nel Wheel Lab.\n\nRISULTATI:\n- Poke: ${results.pokeDiff}mm\n- Inset: ${results.insetDiff}mm`;
    await addLog.mutateAsync({ vehicle_id: selectedVehicleId, title: logTitle, description: logDesc, type: 'modification', event_date: new Date().toISOString() });
  };

  // Componente per il profilo della ruota (SVG)
  const WheelProfile = ({ data, color, isNew = false }: { data: any, color: string, isNew?: boolean }) => {
    const rimW = data.width * 15; // Scaling per visualizzazione
    const tireW = (data.tireW / 25.4) * 15;
    const offset = (data.et - data.spacer) * 0.5;

    return (
      <g transform={`translate(${-offset}, 0)`}>
        {/* Pneumatico */}
        <path 
          d={`M ${-tireW/2} 10 Q ${-tireW/2} 0 0 0 Q ${tireW/2} 0 ${tireW/2} 10 L ${tireW/2} 240 Q ${tireW/2} 250 0 250 Q ${-tireW/2} 250 ${-tireW/2} 240 Z`}
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity={isNew ? 1 : 0.3}
        />
        {/* Cerchio */}
        <path 
          d={`M ${-rimW/2} 30 L ${rimW/2} 30 L ${rimW/2} 220 L ${-rimW/2} 220 Z`}
          fill={isNew ? `${color}20` : "none"}
          stroke={color}
          strokeWidth="1.5"
          opacity={isNew ? 0.8 : 0.2}
        />
        {/* Canale/Razze (Semplificato) */}
        <path 
          d={`M 0 30 L 0 220 M ${-rimW/2} 125 L ${rimW/2} 125`}
          stroke={color}
          strokeWidth="1"
          opacity={isNew ? 0.4 : 0.1}
        />
      </g>
    );
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black italic uppercase tracking-tighter">Calcolatore Fitment Avanzato</h2>
        <button className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all">
          <Info size={14} /> Info
        </button>
      </div>

      {/* Input Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ruota Attuale */}
        <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 text-center italic">Ruota Attuale</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Diametro:</span>
              <select value={current.diameter} onChange={e => setCurrent({...current, diameter: parseInt(e.target.value)})} className="bg-transparent font-black italic text-sm outline-none">
                {[15,16,17,18,19,20,21,22].map(v => <option key={v} value={v}>{v}"</option>)}
              </select>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Canale:</span>
              <select value={current.width} onChange={e => setCurrent({...current, width: parseFloat(e.target.value)})} className="bg-transparent font-black italic text-sm outline-none">
                {[7,7.5,8,8.5,9,9.5,10,10.5,11,12].map(v => <option key={v} value={v}>{v}J</option>)}
              </select>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">ET (Offset):</span>
              <div className="flex items-center gap-2">
                <span className="text-zinc-600 text-xs font-black">+</span>
                <input type="number" value={current.et} onChange={e => setCurrent({...current, et: parseInt(e.target.value) || 0})} className="w-12 bg-transparent font-black italic text-sm outline-none text-right" />
              </div>
            </div>
            <div className="pt-2">
              <p className="text-[8px] font-black text-zinc-600 uppercase mb-2">Pneumatico</p>
              <div className="bg-black/20 rounded-xl p-3 text-xs font-black italic text-zinc-400">
                {current.tireW}/{current.tireA} R{current.diameter}
              </div>
            </div>
          </div>
        </div>

        {/* Nuova Ruota */}
        <div className="bg-zinc-900/60 backdrop-blur-md border border-emerald-500/20 p-6 rounded-[2rem] space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] -mr-16 -mt-16" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 text-center italic">Nuova Ruota</h3>
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Diametro:</span>
              <select value={next.diameter} onChange={e => setNext({...next, diameter: parseInt(e.target.value)})} className="bg-transparent font-black italic text-sm outline-none text-emerald-400">
                {[15,16,17,18,19,20,21,22].map(v => <option key={v} value={v}>{v}"</option>)}
              </select>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Canale:</span>
              <select value={next.width} onChange={e => setNext({...next, width: parseFloat(e.target.value)})} className="bg-transparent font-black italic text-sm outline-none text-emerald-400">
                {[7,7.5,8,8.5,9,9.5,10,10.5,11,12].map(v => <option key={v} value={v}>{v}J</option>)}
              </select>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">ET (Offset):</span>
              <div className="flex items-center gap-2">
                <span className="text-emerald-900 text-xs font-black">+</span>
                <input type="number" value={next.et} onChange={e => setNext({...next, et: parseInt(e.target.value) || 0})} className="w-12 bg-transparent font-black italic text-sm outline-none text-right text-emerald-400" />
              </div>
            </div>
            <div className="pt-2">
              <p className="text-[8px] font-black text-emerald-900 uppercase mb-2">Pneumatico</p>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs font-black italic text-emerald-400 flex justify-between items-center">
                {next.tireW}/{next.tireA} R{next.diameter}
                <ChevronDown size={14} className="opacity-40" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visualizer Section */}
      <div className="bg-zinc-950 rounded-[3rem] border border-white/5 p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        
        <div className="relative h-[350px] flex items-center justify-center">
          {/* Fender Line */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-[120px] border-l-2 border-dashed border-white/20 z-0">
            <span className="absolute top-4 -left-3 text-[7px] font-black uppercase tracking-widest text-zinc-600 rotate-90 whitespace-nowrap">Filo Parafango</span>
          </div>

          <svg width="100%" height="100%" viewBox="-200 0 400 300" className="relative z-10">
            <WheelProfile data={current} color="#ef4444" />
            <WheelProfile data={next} color="#10b981" isNew={true} />
            
            {/* Measurement Scale */}
            <g transform="translate(0, 280)">
              <line x1="-150" y1="0" x2="150" y2="0" stroke="white" strokeWidth="0.5" opacity="0.2" />
              {[-100, -50, 0, 50, 100].map(x => (
                <line key={x} x1={x} y1="-3" x2={x} y2="3" stroke="white" strokeWidth="0.5" opacity="0.2" />
              ))}
            </g>

            {/* Arrow Indicator */}
            <motion.g animate={{ x: -(next.et - next.spacer) * 0.5 }}>
              <path d="M -10 270 L 10 270 L 0 260 Z" fill="white" />
            </motion.g>
          </svg>

          {/* Labels */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-12">
            <div className="text-center">
              <p className="text-[18px] font-black italic text-emerald-400">+{Math.abs(pokeVal)}mm</p>
              <p className="text-[7px] font-black uppercase text-zinc-600 tracking-widest">Esterno</p>
            </div>
            <div className="text-center">
              <p className="text-[18px] font-black italic text-zinc-400">{results.insetDiff}mm</p>
              <p className="text-[7px] font-black uppercase text-zinc-600 tracking-widest">Interno</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="space-y-6">
        <div className="text-center">
          <h4 className="text-lg font-black italic uppercase tracking-tight">
            Risultato: <span className="text-emerald-400">+{Math.abs(pokeVal)}mm Verso l'esterno</span>
          </h4>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold text-zinc-300 uppercase leading-relaxed">
              La nuova ruota sporgerà di <span className="text-white font-black">{Math.abs(pokeVal)}mm</span> in più rispetto all'attuale.
            </p>
          </div>
          <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl">
            <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold text-zinc-300 uppercase leading-relaxed">
              Verificare spazio interno/esterno e possibile necessità di camber o modifiche parafango.
            </p>
          </div>
          <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl">
            <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold text-zinc-300 uppercase leading-relaxed">
              Verificare compatibilità pinze freno con il nuovo disegno del cerchio.
            </p>
          </div>
        </div>

        <Button 
          onClick={handleSaveToGarage}
          className="w-full bg-white text-black hover:bg-zinc-200 h-16 rounded-full font-black uppercase italic tracking-[0.2em] transition-all duration-500 shadow-2xl"
        >
          Salva nel Garage
        </Button>
      </div>
    </div>
  );
};

export default FitmentCalculator;