"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Gauge, Plus, Save, Car, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGarage } from '@/hooks/use-garage';
import { useVehicleLogs } from '@/hooks/use-vehicle-logs';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import { showSuccess, showError } from '@/utils/toast';

const FitmentCalculator = () => {
  const { user } = useAuth();
  const { vehicles, isLoading: loadingVehicles } = useGarage();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  
  const [current, setCurrent] = useState({ 
    width: 8.5, et: 35, diameter: 18, tireW: 225, tireA: 40, spacer: 0, camber: 1.5
  });

  const [next, setNext] = useState({ 
    width: 9.5, et: 22, diameter: 19, tireW: 235, tireA: 35, spacer: 12, camber: 3.5
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

  const handleSaveToGarage = async () => {
    if (!selectedVehicleId) { showError("Seleziona un veicolo"); return; }
    const logTitle = `FITMENT: ${next.width}J ET${next.et} (${next.tireW}/${next.tireA} R${next.diameter}) CAMBER ${next.camber}°`;
    const logDesc = `Configurazione calcolata nel Wheel Lab.\n\nRISULTATI:\n- Poke: ${results.pokeDiff}mm\n- Inset: ${results.insetDiff}mm\n- Camber: ${next.camber}°\n- Speedo: ${results.speedoDiff}%`;
    await addLog.mutateAsync({ vehicle_id: selectedVehicleId, title: logTitle, description: logDesc, type: 'modification', event_date: new Date().toISOString() });
    showSuccess("Salvato nel Diario di Bordo!");
  };

  const WheelProfile = ({ data, color, isNew = false }: { data: any, color: string, isNew?: boolean }) => {
    const rimW = data.width * 15; 
    const tireW = (data.tireW / 25.4) * 15;
    const offset = (data.et - data.spacer) * 0.5;
    const rotation = data.camber || 0;

    return (
      <g transform={`translate(${-offset}, 0) rotate(${rotation}, 0, 125)`}>
        <path 
          d={`M ${-tireW/2} 10 Q ${-tireW/2} 0 0 0 Q ${tireW/2} 0 ${tireW/2} 10 L ${tireW/2} 240 Q ${tireW/2} 250 0 250 Q ${-tireW/2} 250 ${-tireW/2} 240 Z`}
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity={isNew ? 1 : 0.3}
        />
        <path 
          d={`M ${-rimW/2} 30 L ${rimW/2} 30 L ${rimW/2} 220 L ${-rimW/2} 220 Z`}
          fill={isNew ? `${color}20` : "none"}
          stroke={color}
          strokeWidth="1.5"
          opacity={isNew ? 0.8 : 0.2}
        />
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
    <div className="space-y-10">
      {/* Box Visualizzazione (Ottimizzato per Mobile) */}
      <div className="bg-zinc-950 rounded-[2.5rem] border border-white/5 p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        
        <div className="relative h-[320px] flex items-center justify-center">
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-[100px] border-l-2 border-dashed border-white/20 z-0">
            <span className="absolute top-4 -left-3 text-[7px] font-black uppercase tracking-widest text-zinc-600 rotate-90 whitespace-nowrap">Filo Parafango</span>
          </div>

          <svg width="100%" height="100%" viewBox="-200 0 400 300" className="relative z-10">
            <WheelProfile data={current} color="#ef4444" />
            <WheelProfile data={next} color="#ffffff" isNew={true} />
            
            <g transform="translate(0, 280)">
              <line x1="-150" y1="0" x2="150" y2="0" stroke="white" strokeWidth="0.5" opacity="0.2" />
              {[-100, -50, 0, 50, 100].map(x => (
                <line key={x} x1={x} y1="-3" x2={x} y2="3" stroke="white" strokeWidth="0.5" opacity="0.2" />
              ))}
            </g>

            <motion.g animate={{ x: -(next.et - next.spacer) * 0.5 }}>
              <path d="M -10 270 L 10 270 L 0 260 Z" fill="white" />
            </motion.g>
          </svg>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-12 pb-4">
            <div className="text-center">
              <p className="text-[22px] font-black italic text-white leading-none mb-1">
                {pokeVal > 0 ? `+${pokeVal}` : pokeVal}mm
              </p>
              <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">
                {pokeVal > 0 ? 'PIÙ SPORGENTE' : 'PIÙ RIENTRANTE'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Input Form Formattati in colonna */}
      <div className="space-y-6">
        
        {/* Setup Attuale */}
        <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-6 rounded-[2.5rem] space-y-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-8 h-8 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500">
              <Gauge size={16} />
            </div>
            <h4 className="text-[11px] font-black uppercase tracking-widest italic">Setup Attuale</h4>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-500 ml-2">Diam.</Label>
              <Input type="number" value={current.diameter} onChange={e => setCurrent({...current, diameter: parseFloat(e.target.value) || 0})} className="bg-black/40 border-white/10 rounded-full h-11 px-2 text-center font-black italic text-xs text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-500 ml-2">Canale</Label>
              <Input type="number" step="0.5" value={current.width} onChange={e => setCurrent({...current, width: parseFloat(e.target.value) || 0})} className="bg-black/40 border-white/10 rounded-full h-11 px-2 text-center font-black italic text-xs text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-500 ml-2">ET</Label>
              <Input type="number" value={current.et} onChange={e => setCurrent({...current, et: parseFloat(e.target.value) || 0})} className="bg-black/40 border-white/10 rounded-full h-11 px-2 text-center font-black italic text-xs text-white" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-500 ml-2">Gomma L.</Label>
              <Input type="number" value={current.tireW} onChange={e => setCurrent({...current, tireW: parseFloat(e.target.value) || 0})} className="bg-black/40 border-white/10 rounded-full h-11 px-2 text-center font-black italic text-xs text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-500 ml-2">Gomma S.</Label>
              <Input type="number" value={current.tireA} onChange={e => setCurrent({...current, tireA: parseFloat(e.target.value) || 0})} className="bg-black/40 border-white/10 rounded-full h-11 px-2 text-center font-black italic text-xs text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-500 ml-2">Camber</Label>
              <Input type="number" step="0.1" value={current.camber} onChange={e => setCurrent({...current, camber: parseFloat(e.target.value) || 0})} className="bg-black/40 border-white/10 rounded-full h-11 px-2 text-center font-black italic text-xs text-white" />
            </div>
          </div>
        </div>

        {/* Nuovo Setup */}
        <div className="bg-white text-black p-6 rounded-[2.5rem] shadow-2xl space-y-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center text-white">
              <Plus size={16} />
            </div>
            <h4 className="text-[11px] font-black uppercase tracking-widest italic">Nuovo Setup</h4>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-700 ml-2">Diam.</Label>
              <Input type="number" value={next.diameter} onChange={e => setNext({...next, diameter: parseFloat(e.target.value) || 0})} className="bg-white border-black/10 rounded-full h-11 px-2 text-center font-black italic text-xs focus-visible:ring-black/20 text-black" />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-700 ml-2">Canale</Label>
              <Input type="number" step="0.5" value={next.width} onChange={e => setNext({...next, width: parseFloat(e.target.value) || 0})} className="bg-white border-black/10 rounded-full h-11 px-2 text-center font-black italic text-xs focus-visible:ring-black/20 text-black" />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-700 ml-2">ET</Label>
              <Input type="number" value={next.et} onChange={e => setNext({...next, et: parseFloat(e.target.value) || 0})} className="bg-white border-black/10 rounded-full h-11 px-2 text-center font-black italic text-xs focus-visible:ring-black/20 text-black" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-black/5">
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-700 ml-2">Gomma L.</Label>
              <Input type="number" value={next.tireW} onChange={e => setNext({...next, tireW: parseFloat(e.target.value) || 0})} className="bg-white border-black/10 rounded-full h-11 px-2 text-center font-black italic text-xs focus-visible:ring-black/20 text-black" />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-700 ml-2">Gomma S.</Label>
              <Input type="number" value={next.tireA} onChange={e => setNext({...next, tireA: parseFloat(e.target.value) || 0})} className="bg-white border-black/10 rounded-full h-11 px-2 text-center font-black italic text-xs focus-visible:ring-black/20 text-black" />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-700 ml-2">Camber</Label>
              <Input type="number" step="0.1" value={next.camber} onChange={e => setNext({...next, camber: parseFloat(e.target.value) || 0})} className="bg-white border-black/10 rounded-full h-11 px-2 text-center font-black italic text-xs focus-visible:ring-black/20 text-black" />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-red-600 ml-2">Distanziale</Label>
              <Input type="number" value={next.spacer} onChange={e => setNext({...next, spacer: parseFloat(e.target.value) || 0})} className="bg-red-50 border-red-200 rounded-full h-11 px-2 text-center font-black italic text-xs text-red-600 focus-visible:ring-red-200" />
            </div>
          </div>
        </div>

      </div>

      {/* Cards Risultati */}
      <div className="space-y-4">
        <div className="bg-zinc-900/50 border border-white/10 p-5 rounded-[2rem] flex items-center justify-between shadow-lg">
          <div className="flex-1 pr-4">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 italic mb-1">Assetto Esterno</p>
            <p className="text-[8px] font-bold text-zinc-400 uppercase leading-tight">Sporgenza totale calcolata inclusi distanziali.</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-3xl font-black italic tracking-tighter", pokeVal > 0 ? "text-white" : "text-zinc-600")}>
              {pokeVal > 0 ? `+${pokeVal}` : pokeVal}
            </span>
            <span className="text-[10px] font-black text-zinc-500">mm</span>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/10 p-5 rounded-[2rem] flex items-center justify-between shadow-lg">
          <div className="flex-1 pr-4">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 italic mb-1">Diametro Totale</p>
            <p className="text-[8px] font-bold text-zinc-400 uppercase leading-tight">Variazione dell'altezza totale della ruota finita.</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-3xl font-black italic tracking-tighter", Math.abs(parseFloat(results.diameterDiff)) > 10 ? "text-orange-500" : "text-white")}>
              {parseFloat(results.diameterDiff) > 0 ? `+${results.diameterDiff}` : results.diameterDiff}
            </span>
            <span className="text-[10px] font-black text-zinc-500">mm</span>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/10 p-5 rounded-[2rem] flex items-center justify-between shadow-lg">
          <div className="flex-1 pr-4">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 italic mb-1">Errore Tachimetro</p>
            <p className="text-[8px] font-bold text-zinc-400 uppercase leading-tight">
              A 100km/h indicati, andrai a <span className="text-white">{results.actualSpeed}</span>.
            </p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-3xl font-black italic tracking-tighter", Math.abs(parseFloat(results.speedoDiff)) > 3 ? "text-red-500" : "text-green-400")}>
              {results.speedoDiff}
            </span>
            <span className="text-[10px] font-black text-zinc-500">%</span>
          </div>
        </div>
      </div>

      {user && vehicles && vehicles.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] shadow-2xl text-center space-y-6"
        >
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl">
              <Car size={24} />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-black italic uppercase tracking-tight mb-1">Salva Configurazione</h4>
            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Archivia nel Diario di Bordo</p>
          </div>

          <div className="space-y-4 w-full">
            <div className="relative w-full">
              <select 
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-full h-14 px-6 text-[10px] font-black uppercase italic appearance-none focus:border-white/30 transition-all text-white"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.brand} {v.model}</option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                <Car size={14} />
              </div>
            </div>

            <Button 
              onClick={handleSaveToGarage}
              disabled={addLog.isPending}
              className="w-full bg-white text-black hover:bg-zinc-200 h-14 rounded-full font-black uppercase italic text-[10px] tracking-widest transition-all shadow-xl"
            >
              {addLog.isPending ? <Loader2 className="animate-spin" /> : <><Save size={16} className="mr-2" /> Salva nel Garage</>}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FitmentCalculator;