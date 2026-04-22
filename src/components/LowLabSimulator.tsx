"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MoveVertical, RotateCcw, Download, Sparkles, Loader2, ShieldCheck, Gauge, Target, Info, MousePointer2 } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

const LowLabSimulator = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [drop, setDrop] = useState(0);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  
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
      showSuccess("3D Mapping completato. Centra i mirini sui cerchi.");
    }, 2000);
  };

  const updateWheelPos = (side: 'front' | 'rear', axis: 'x' | 'y', val: number) => {
    setWheels(prev => ({
      ...prev,
      [side]: { ...prev[side], [axis]: val }
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
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Per un tuck perfetto usa una foto di profilo</p>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Simulator Canvas */}
      <div 
        ref={containerRef}
        className="relative aspect-video md:aspect-[21/9] bg-zinc-950 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl touch-none"
      >
        {/* LAYER 1: SFONDO (FOTO ORIGINALE FERMA) */}
        <div className="absolute inset-0 w-full h-full z-0">
          <img src={image} className="w-full h-full object-contain" alt="Static Background" />
        </div>

        {/* LAYER 2: SCOCCA MOBILE (FOTO CON BUCHI TRASPARENTI SUI CERCHI) */}
        <motion.div 
          className="absolute inset-0 w-full h-full z-20 pointer-events-none"
          animate={{ y: drop }}
          transition={{ type: 'spring', damping: 30, stiffness: 100 }}
        >
          <div 
            className="w-full h-full"
            style={{ 
              backgroundImage: `url(${image})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              // Maschera Radiale: Crea due cerchi TRASPARENTI dove si vedrà lo sfondo (i cerchi fermi)
              WebkitMaskImage: `radial-gradient(circle ${wheels.front.r}% at ${wheels.front.x}% ${wheels.front.y}%, transparent 95%, black 100%), 
                               radial-gradient(circle ${wheels.rear.r}% at ${wheels.rear.x}% ${wheels.rear.y}%, transparent 95%, black 100%)`,
              maskImage: `radial-gradient(circle ${wheels.front.r}% at ${wheels.front.x}% ${wheels.front.y}%, transparent 95%, black 100%), 
                          radial-gradient(circle ${wheels.rear.r}% at ${wheels.rear.x}% ${wheels.rear.y}%, transparent 95%, black 100%)`,
              WebkitMaskComposite: 'destination-in',
              maskComposite: 'intersect'
            }}
          />
          
          {/* Ombra interna del passaruota che scende con la scocca */}
          <div 
            className="absolute inset-0 z-30 pointer-events-none opacity-60"
            style={{ 
              background: `radial-gradient(circle ${wheels.front.r + 2}% at ${wheels.front.x}% ${wheels.front.y}%, rgba(0,0,0,${(drop/150)}) 0%, transparent 80%), 
                           radial-gradient(circle ${wheels.rear.r + 2}% at ${wheels.rear.x}% ${wheels.rear.y}%, rgba(0,0,0,${(drop/150)}) 0%, transparent 80%)`
            }}
          />
        </motion.div>

        {/* LAYER 3: TARGET DI CALIBRAZIONE (Mirini) */}
        <AnimatePresence>
          {drop === 0 && !isAnalyzing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-40 pointer-events-none">
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
              
              {/* Mirino Anteriore */}
              <div 
                className="absolute w-12 h-12 -ml-6 -mt-6 flex items-center justify-center pointer-events-auto cursor-move"
                style={{ left: `${wheels.front.x}%`, top: `${wheels.front.y}%` }}
              >
                <div className="absolute inset-0 border-2 border-white/50 rounded-full animate-ping" />
                <Target size={24} className="text-white drop-shadow-lg" />
              </div>

              {/* Mirino Posteriore */}
              <div 
                className="absolute w-12 h-12 -ml-6 -mt-6 flex items-center justify-center pointer-events-auto cursor-move"
                style={{ left: `${wheels.rear.x}%`, top: `${wheels.rear.y}%` }}
              >
                <div className="absolute inset-0 border-2 border-white/50 rounded-full animate-ping" />
                <Target size={24} className="text-white drop-shadow-lg" />
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center space-y-2">
                <p className="bg-white text-black px-4 py-2 rounded-full text-[10px] font-black uppercase italic shadow-2xl">
                  Centra i mirini sui cerchi
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
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Mapping Chassis & Wheels...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Actions */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-50">
          <button onClick={() => setDrop(0)} className="p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black transition-all shadow-xl border border-white/10">
            <RotateCcw size={18} />
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-white text-black rounded-full hover:scale-110 transition-all shadow-xl">
            <Camera size={20} />
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500"><MoveVertical size={20} /></div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest italic text-white">Regolazione Altezza</h4>
                <p className="text-[8px] font-bold uppercase text-zinc-600 tracking-widest">La scocca scende sopra i cerchi</p>
              </div>
            </div>
            <span className="text-2xl font-black italic text-white">-{Math.round(drop / 1.5)}mm</span>
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

        <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] space-y-4">
          <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest text-center">Calibrazione Ruote (Fase 1)</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-600 ml-2">Altezza Mirini</Label>
              <Slider value={[wheels.front.y]} min={30} max={90} onValueChange={(v) => {
                setWheels(prev => ({ front: { ...prev.front, y: v[0] }, rear: { ...prev.rear, y: v[0] } }));
              }} />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] font-black uppercase text-zinc-600 ml-2">Dimensione Foro</Label>
              <Slider value={[wheels.front.r]} min={5} max={25} onValueChange={(v) => {
                setWheels(prev => ({ front: { ...prev.front, r: v[0] }, rear: { ...prev.rear, r: v[0] } }));
              }} />
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pb-10">
        <p className="text-[8px] font-black uppercase text-zinc-800 tracking-[0.4em] italic mb-6">Low District Engineering Visualizer</p>
        <Button onClick={() => showSuccess("Simulazione salvata!") } className="bg-white text-black hover:bg-zinc-200 rounded-full h-16 px-12 font-black uppercase italic tracking-widest shadow-2xl transition-all border-none">
          Esporta Configurazione
        </Button>
      </div>
    </div>
  );
};

export default LowLabSimulator;