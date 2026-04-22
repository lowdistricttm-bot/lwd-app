"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Camera, MoveVertical, RotateCcw, Download, Sparkles, Loader2, Target, MoveHorizontal, Ruler } from 'lucide-react';
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
      setIsAnalyzing(true);
      setTimeout(() => setIsAnalyzing(false), 2000);
    }
  };

  // Funzione core per il drag dei mirini
  const handleMarkerDrag = (side: 'front' | 'rear', info: any) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calcola la posizione del tocco relativa al contenitore in percentuale
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
      front: { x: 28, y: 65, r: 12 },
      rear: { x: 72, y: 65, r: 12 }
    });
    showSuccess("Simulatore resettato.");
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
        className="relative aspect-video md:aspect-[21/9] bg-zinc-950 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl touch-none select-none"
      >
        {/* LAYER 1: RUOTE ORIGINALI (Sfondo fisso) */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <img src={image} className="w-full h-full object-contain" alt="Original Wheels" />
        </div>

        {/* LAYER 2: SCOCCA MOBILE (Con maschera dinamica) */}
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
              // Maschera radiale basata sulle posizioni dei mirini
              WebkitMaskImage: `radial-gradient(circle ${wheels.front.r}% at ${wheels.front.x}% ${wheels.front.y}%, transparent 98%, black 100%), 
                               radial-gradient(circle ${wheels.rear.r}% at ${wheels.rear.x}% ${wheels.rear.y}%, transparent 98%, black 100%)`,
              maskImage: `radial-gradient(circle ${wheels.front.r}% at ${wheels.front.x}% ${wheels.front.y}%, transparent 98%, black 100%), 
                          radial-gradient(circle ${wheels.rear.r}% at ${wheels.rear.x}% ${wheels.rear.y}%, transparent 98%, black 100%)`,
              WebkitMaskComposite: 'destination-in',
              maskComposite: 'intersect'
            }}
          />
          
          {/* Ombra interna del passaruota */}
          <div 
            className="absolute inset-0 z-30 pointer-events-none"
            style={{ 
              background: `radial-gradient(circle ${wheels.front.r + 0.5}% at ${wheels.front.x}% ${wheels.front.y}%, rgba(0,0,0,${(drop/100)}) 0%, transparent 80%), 
                           radial-gradient(circle ${wheels.rear.r + 0.5}% at ${wheels.rear.x}% ${wheels.rear.y}%, rgba(0,0,0,${(drop/100)}) 0%, transparent 80%)`
            }}
          />
        </motion.div>

        {/* LAYER 3: MIRINI TRASCINABILI INDIPENDENTI */}
        <div className="absolute inset-0 z-40 pointer-events-none">
          {/* Mirino Anteriore */}
          <motion.div 
            drag
            dragMomentum={false}
            onDrag={(_, info) => handleMarkerDrag('front', info)}
            className={cn(
              "absolute w-20 h-20 -ml-10 -mt-10 flex items-center justify-center pointer-events-auto cursor-move active:scale-110 transition-transform",
              drop > 0 && "opacity-0 pointer-events-none" // Nascondi mirini durante lo slide
            )}
            style={{ left: `${wheels.front.x}%`, top: `${wheels.front.y}%` }}
          >
            <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-pulse" />
            <div className="w-[1px] h-full bg-white/20 absolute left-1/2 -translate-x-1/2" />
            <div className="h-[1px] w-full bg-white/20 absolute top-1/2 -translate-y-1/2" />
            <Target size={32} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]" />
            <div className="absolute -bottom-6 bg-white text-black px-2 py-0.5 rounded text-[7px] font-black uppercase italic">Anteriore</div>
          </motion.div>

          {/* Mirino Posteriore */}
          <motion.div 
            drag
            dragMomentum={false}
            onDrag={(_, info) => handleMarkerDrag('rear', info)}
            className={cn(
              "absolute w-20 h-20 -ml-10 -mt-10 flex items-center justify-center pointer-events-auto cursor-move active:scale-110 transition-transform",
              drop > 0 && "opacity-0 pointer-events-none"
            )}
            style={{ left: `${wheels.rear.x}%`, top: `${wheels.rear.y}%` }}
          >
            <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-pulse" />
            <div className="w-[1px] h-full bg-white/20 absolute left-1/2 -translate-x-1/2" />
            <div className="h-[1px] w-full bg-white/20 absolute top-1/2 -translate-y-1/2" />
            <Target size={32} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]" />
            <div className="absolute -bottom-6 bg-white text-black px-2 py-0.5 rounded text-[7px] font-black uppercase italic">Posteriore</div>
          </motion.div>
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-50 pointer-events-none">
          <button 
            onClick={reset} 
            className="p-4 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black transition-all shadow-xl border border-white/10 pointer-events-auto active:scale-90"
          >
            <RotateCcw size={20} />
          </button>
          
          {drop === 0 && (
            <div className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-[9px] font-black uppercase italic tracking-widest text-white animate-in fade-in slide-in-from-bottom-2">
              Trascina i mirini sui cerchi
            </div>
          )}

          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="p-4 bg-white text-black rounded-full hover:scale-110 transition-all shadow-xl pointer-events-auto active:scale-90"
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
                <h4 className="text-xs font-black uppercase tracking-widest italic text-white">Assetto Dinamico</h4>
                <p className="text-[8px] font-bold uppercase text-zinc-600 tracking-widest">Regolazione Compressione</p>
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
            <Ruler size={14} className="text-zinc-500" />
            <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Setup Ruote</p>
          </div>
          
          <div className="space-y-5">
            {/* Larghezza Mirini (Distanza tra gli assi) */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-[8px] font-black uppercase text-zinc-600 ml-1">Carreggiata (Asse)</Label>
                <span className="text-[8px] font-black text-white italic">OFFSET</span>
              </div>
              <Slider 
                value={[wheels.front.x]} 
                min={0} max={50} 
                onValueChange={(v) => {
                  const diff = v[0] - wheels.front.x;
                  setWheels(prev => ({ 
                    front: { ...prev.front, x: v[0] }, 
                    rear: { ...prev.rear, x: prev.rear.x - diff } 
                  }));
                }} 
              />
            </div>

            {/* Dimensione Foro (Raggio maschera) */}
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
        <Button onClick={() => showSuccess("Simulazione salvata!") } className="bg-white text-black hover:bg-zinc-200 rounded-full h-16 px-12 font-black uppercase italic tracking-widest shadow-2xl transition-all border-none w-full max-w-md">
          <Download size={18} className="mr-2" /> Esporta Report
        </Button>
      </div>
    </div>
  );
};

export default LowLabSimulator;