"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MoveVertical, RotateCcw, Download, Sparkles, Loader2, Target, Ruler } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

const LowLabSimulator = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [drop, setDrop] = useState(0);
  
  // Stato dei mirini in percentuale (0-100)
  const [wheels, setWheels] = useState({
    front: { x: 30, y: 60, r: 12 },
    rear: { x: 70, y: 60, r: 12 }
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      setDrop(0);
      setIsAnalyzing(true);
      setTimeout(() => setIsAnalyzing(false), 1500);
    }
  };

  const handleMarkerDrag = (side: 'front' | 'rear', info: any) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    const x = ((info.point.x - rect.left) / rect.width) * 100;
    const y = ((info.point.y - rect.top) / rect.height) * 100;

    setWheels(prev => ({
      ...prev,
      [side]: { 
        ...prev[side], 
        x: Math.max(0, Math.min(100, x)), 
        y: Math.max(0, Math.min(100, y)) 
      }
    }));
  };

  const reset = () => {
    setDrop(0);
    setWheels({
      front: { x: 30, y: 60, r: 12 },
      rear: { x: 70, y: 60, r: 12 }
    });
    showSuccess("Simulatore resettato.");
  };

  // Funzione per generare la maschera CSS corretta
  // Usa "destination-out" logico: disegnamo due cerchi trasparenti su uno sfondo nero
  const getMaskStyle = () => {
    if (!image) return {};
    return {
      WebkitMaskImage: `radial-gradient(circle ${wheels.front.r}% at ${wheels.front.x}% ${wheels.front.y}%, transparent 98%, black 100%), 
                        radial-gradient(circle ${wheels.rear.r}% at ${wheels.rear.x}% ${wheels.rear.y}%, transparent 98%, black 100%)`,
      maskImage: `radial-gradient(circle ${wheels.front.r}% at ${wheels.front.x}% ${wheels.front.y}%, transparent 98%, black 100%), 
                  radial-gradient(circle ${wheels.rear.r}% at ${wheels.rear.x}% ${wheels.rear.y}%, transparent 98%, black 100%)`,
      WebkitMaskComposite: 'destination-in',
      maskComposite: 'intersect',
      backgroundImage: `url(${image})`,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    };
  };

  if (!image) {
    return (
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="aspect-video md:aspect-[21/9] border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all group bg-zinc-900/20"
      >
        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
          <Camera size={32} className="text-zinc-500 group-hover:text-white transition-colors" />
        </div>
        <h3 className="text-xl font-black italic uppercase tracking-tight mb-2">Carica Foto Laterale</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">L'auto deve essere di profilo</p>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div 
        ref={containerRef}
        className="relative aspect-video md:aspect-[21/9] bg-zinc-950 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl touch-none select-none"
      >
        {/* LIVELLO 1: RUOTE (Fisse sullo sfondo) */}
        <div 
          className="absolute inset-0 w-full h-full z-0 opacity-40"
          style={{ 
            backgroundImage: `url(${image})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* LIVELLO 2: SCOCCA (Si muove e ha i buchi) */}
        <motion.div 
          className="absolute inset-0 w-full h-full z-20"
          animate={{ y: drop }}
          transition={{ type: 'spring', damping: 40, stiffness: 150 }}
          style={getMaskStyle()}
        />

        {/* LIVELLO 3: MIRINI (Solo per calibrazione) */}
        <div className="absolute inset-0 z-40 pointer-events-none">
          <AnimatePresence>
            {drop === 0 && (
              <>
                <motion.div 
                  drag
                  dragMomentum={false}
                  onDrag={(_, info) => handleMarkerDrag('front', info)}
                  className="absolute w-24 h-24 -ml-12 -mt-12 flex items-center justify-center pointer-events-auto cursor-move"
                  style={{ left: `${wheels.front.x}%`, top: `${wheels.front.y}%` }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="absolute inset-0 border-2 border-white/40 rounded-full animate-pulse" />
                  <Target size={32} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                </motion.div>

                <motion.div 
                  drag
                  dragMomentum={false}
                  onDrag={(_, info) => handleMarkerDrag('rear', info)}
                  className="absolute w-24 h-24 -ml-12 -mt-12 flex items-center justify-center pointer-events-auto cursor-move"
                  style={{ left: `${wheels.rear.x}%`, top: `${wheels.rear.y}%` }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="absolute inset-0 border-2 border-white/40 rounded-full animate-pulse" />
                  <Target size={32} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* UI Overlay */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-50 pointer-events-none">
          <button 
            onClick={reset} 
            className="p-4 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black transition-all shadow-xl border border-white/10 pointer-events-auto active:scale-90"
          >
            <RotateCcw size={20} />
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="p-4 bg-white text-black rounded-full hover:scale-110 transition-all shadow-xl pointer-events-auto active:scale-90"
          >
            <Camera size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] space-y-8 shadow-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500"><MoveVertical size={20} /></div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest italic text-white">Assetto Dinamico</h4>
                <p className="text-[8px] font-bold uppercase text-zinc-600 tracking-widest">Simula l'abbassamento</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black italic text-white">-{Math.round(drop / 1.2)}<span className="text-xs ml-1">mm</span></span>
            </div>
          </div>
          <Slider value={[drop]} max={120} onValueChange={(val) => setDrop(val[0])} className="py-4" />
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] space-y-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Ruler size={14} className="text-zinc-500" />
            <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Setup Fori Ruota</p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-[8px] font-black uppercase text-zinc-600 ml-1">Diametro Maschera</Label>
                <span className="text-[8px] font-black text-white italic">{wheels.front.r}%</span>
              </div>
              <Slider 
                value={[wheels.front.r]} 
                min={5} max={25} 
                onValueChange={(v) => setWheels(prev => ({ 
                  front: { ...prev.front, r: v[0] }, 
                  rear: { ...prev.rear, r: v[0] } 
                }))} 
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-zinc-900/20 border border-white/5 p-6 rounded-[2rem] text-center">
        <p className="text-[8px] font-black uppercase text-zinc-600 tracking-[0.3em] italic">
          Istruzioni: Allinea i mirini ai centri dei cerchi e usa lo slider per abbassare la scocca.
        </p>
      </div>
      
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
    </div>
  );
};

export default LowLabSimulator;