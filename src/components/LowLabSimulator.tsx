"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MoveVertical, RotateCcw, Download, Sparkles, Loader2, ShieldCheck, Gauge, Target, Info, MousePointer2, MoveHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

const LowLabSimulator = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [drop, setDrop] = useState(0);
  
  // Coordinate dei centri ruota (in percentuale della foto)
  const [wheels, setWheels] = useState({
    front: { x: 28, y: 65, r: 12 },
    rear: { x: 72, y: 65, r: 12 }
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      setDrop(0);
      startSmartAnalysis();
    }
  };

  const startSmartAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      showSuccess("Calibrazione completata. Trascina i mirini per la massima precisione.");
    }, 2000);
  };

  const reset = () => {
    setDrop(0);
    // Opzionalmente resettiamo anche le posizioni se l'utente vuole ripartire da zero
    setWheels({
      front: { x: 28, y: 65, r: 12 },
      rear: { x: 72, y: 65, r: 12 }
    });
    showSuccess("Simulatore resettato.");
  };

  // Calcola la posizione in percentuale durante il drag
  const handleDrag = (side: 'front' | 'rear', info: any) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calcoliamo la nuova posizione relativa basata sul movimento
    const xPerc = ((info.point.x - rect.left) / rect.width) * 100;
    const yPerc = ((info.point.y - rect.top) / rect.height) * 100;

    setWheels(prev => ({
      ...prev,
      [side]: { 
        ...prev[side], 
        x: Math.max(0, Math.min(100, xPerc)), 
        y: Math.max(0, Math.min(100, yPerc)) 
      }
    }));
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
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Proietta il futuro del tuo progetto</p>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Simulator Canvas */}
      <div 
        ref={containerRef}
        className="relative aspect-video md:aspect-[21/9] bg-zinc-950 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl touch-none"
      >
        {/* LAYER 1: RUOTE ORIGINALI (Sotto, ferme) */}
        <div className="absolute inset-0 w-full h-full z-0">
          <img src={image} className="w-full h-full object-contain" alt="Wheels Layer" />
        </div>

        {/* LAYER 2: SCOCCA MOBILE (Sopra, con buchi) */}
        <motion.div 
          className="absolute inset-0 w-full h-full z-20 pointer-events-none"
          animate={{ y: drop }}
          transition={{ type: 'spring', damping: 35, stiffness: 120 }}
        >
          <div 
            className="w-full h-full"
            style={{ 
              backgroundImage: `url(${image})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              // Maschera che crea i fori per le ruote
              WebkitMaskImage: `radial-gradient(circle ${wheels.front.r}% at ${wheels.front.x}% ${wheels.front.y}%, transparent 98%, black 100%), 
                               radial-gradient(circle ${wheels.rear.r}% at ${wheels.rear.x}% ${wheels.rear.y}%, transparent 98%, black 100%)`,
              maskImage: `radial-gradient(circle ${wheels.front.r}% at ${wheels.front.x}% ${wheels.front.y}%, transparent 98%, black 100%), 
                          radial-gradient(circle ${wheels.rear.r}% at ${wheels.rear.x}% ${wheels.rear.y}%, transparent 98%, black 100%)`,
              WebkitMaskComposite: 'destination-in',
              maskComposite: 'intersect'
            }}
          />
          
          {/* Ombra interna dei passaruota */}
          <div 
            className="absolute inset-0 z-30 pointer-events-none opacity-60"
            style={{ 
              background: `radial-gradient(circle ${wheels.front.r + 1}% at ${wheels.front.x}% ${wheels.front.y}%, rgba(0,0,0,${(drop/120)}) 0%, transparent 80%), 
                           radial-gradient(circle ${wheels.rear.r + 1}% at ${wheels.rear.x}% ${wheels.rear.y}%, rgba(0,0,0,${(drop/120)}) 0%, transparent 80%)`
            }}
          />
        </motion.div>

        {/* LAYER 3: TARGET TRASCINABILI (Mirini) */}
        <AnimatePresence>
          {drop === 0 && !isAnalyzing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 pointer-events-none">
              <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
              
              {/* Mirino Anteriore TRASCINABILE */}
              <motion.div 
                drag
                dragMomentum={false}
                onDrag={(_, info) => handleDrag('front', info)}
                className="absolute w-16 h-16 -ml-8 -mt-8 flex items-center justify-center pointer-events-auto cursor-move active:scale-125 transition-transform"
                style={{ left: `${wheels.front.x}%`, top: `${wheels.front.y}%` }}
              >
                <div className="absolute inset-0 border-2 border-white/30 rounded-full animate-pulse" />
                <div className="w-1 h-full bg-white/20 absolute left-1/2 -translate-x-1/2" />
                <div className="h-1 w-full bg-white/20 absolute top-1/2 -translate-y-1/2" />
                <Target size={28} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
              </motion.div>

              {/* Mirino Posteriore TRASCINABILE */}
              <motion.div 
                drag
                dragMomentum={false}
                onDrag={(_, info) => handleDrag('rear', info)}
                className="absolute w-16 h-16 -ml-8 -mt-8 flex items-center justify-center pointer-events-auto cursor-move active:scale-125 transition-transform"
                style={{ left: `${wheels.rear.x}%`, top: `${wheels.rear.y}%` }}
              >
                <div className="absolute inset-0 border-2 border-white/30 rounded-full animate-pulse" />
                <div className="w-1 h-full bg-white/20 absolute left-1/2 -translate-x-1/2" />
                <div className="h-1 w-full bg-white/20 absolute top-1/2 -translate-y-1/2" />
                <Target size={28} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
              </motion.div>

              <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center">
                <p className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-black uppercase italic shadow-2xl tracking-widest border-2 border-black">
                  Tocca e Trascina i mirini sui cerchi
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analisi AI Overlay */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-white mb-4" size={48} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Detecting Axles & Wheelwells...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Actions */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-50">
          <button 
            onClick={reset} 
            className="p-4 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black transition-all shadow-xl border border-white/10 active:scale-90"
            title="Reset"
          >
            <RotateCcw size={20} />
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="p-4 bg-white text-black rounded-full hover:scale-110 transition-all shadow-xl active:scale-90"
            title="Nuova Foto"
          >
            <Camera size={24} />
          </button>
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] space-y-8 shadow-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500"><MoveVertical size={20} /></div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest italic text-white">Regolazione Altezza</h4>
                <p className="text-[8px] font-bold uppercase text-zinc-600 tracking-widest">Compressione Sospensioni</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black italic text-white">-{Math.round(drop / 1.5)}<span className="text-xs ml-1">mm</span></span>
            </div>
          </div>

          <div className="px-2">
            <Slider 
              value={[drop]} 
              max={150} 
              onValueChange={(val) => setDrop(val[0])}
              className="py-4"
            />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] space-y-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} className="text-zinc-500" />
            <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Fine-Tuning Ruote</p>
          </div>
          
          <div className="space-y-5">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-[8px] font-black uppercase text-zinc-600 ml-1">Posizione (Larghezza)</Label>
                <span className="text-[8px] font-black text-white italic">OFFSET</span>
              </div>
              <Slider 
                value={[wheels.front.x]} 
                min={0} max={100} 
                onValueChange={(v) => {
                  const diff = v[0] - wheels.front.x;
                  setWheels(prev => ({ 
                    front: { ...prev.front, x: v[0] }, 
                    rear: { ...prev.rear, x: prev.rear.x + diff } 
                  }));
                }} 
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-[8px] font-black uppercase text-zinc-600 ml-1">Dimensione Foro</Label>
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

      <div className="text-center">
        <p className="text-[8px] font-black uppercase text-zinc-800 tracking-[0.4em] italic mb-6">Low District Engineering Visualizer</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 px-6">
          <Button onClick={() => showSuccess("Simulazione salvata!") } className="bg-white text-black hover:bg-zinc-200 rounded-full h-16 px-12 font-black uppercase italic tracking-widest shadow-2xl transition-all border-none flex-1 max-w-md mx-auto">
            <Download size={18} className="mr-2" /> Esporta Configurazione
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LowLabSimulator;