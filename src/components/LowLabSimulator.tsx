"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MoveVertical, RotateCcw, Download, Layers, GripHorizontal, Info, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

const LowLabSimulator = () => {
  const [image, setImage] = useState<string | null>(null);
  const [drop, setDrop] = useState(0);
  const [cutLine, setCutLine] = useState(65); // Default ottimale per foto laterali
  const [isAdjustingCut, setIsAdjustingCut] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setDrop(0);
      setCutLine(65); // Reset alla calibrazione ideale
    }
  };

  const reset = () => {
    setDrop(0);
    setCutLine(65);
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
        <h3 className="text-xl font-black italic uppercase tracking-tight mb-2">Carica la tua Auto</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Usa una foto perfettamente laterale</p>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Simulator Canvas */}
      <div className="relative aspect-video md:aspect-[21/9] bg-zinc-950 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl touch-none">
        
        {/* Layer 1: Sfondo statico (Ruote e Terreno) */}
        <div className="absolute inset-0 w-full h-full z-0">
          <img src={image} className="w-full h-full object-contain opacity-40 blur-[2px]" alt="" />
        </div>

        {/* Layer 2: Ombra dinamica passaruota (Aumenta con il drop) */}
        <div 
          className="absolute inset-0 w-full h-full z-10 pointer-events-none transition-opacity duration-300"
          style={{ 
            opacity: drop / 150,
            background: `linear-gradient(to bottom, transparent ${cutLine - 10}%, rgba(0,0,0,0.8) ${cutLine}%, transparent ${cutLine + 5}%)`
          }}
        />

        {/* Layer 3: Carrozzeria Mobile */}
        <div 
          className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out z-20"
          style={{ 
            transform: `translateY(${drop}px)`,
            clipPath: `inset(0 0 ${100 - cutLine}% 0)` 
          }}
        >
          <img src={image} className="w-full h-full object-contain" alt="Car Body" />
          
          {/* Sfumatura sul taglio per realismo */}
          <div 
            className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/20 to-transparent"
            style={{ top: `${cutLine}%` }}
          />
        </div>

        {/* Layer 4: Ruote Statiche (Parte inferiore dell'immagine originale) */}
        <div 
          className="absolute inset-0 w-full h-full z-10"
          style={{ clipPath: `inset(${cutLine}% 0 0 0)` }}
        >
          <img src={image} className="w-full h-full object-contain" alt="Car Wheels" />
        </div>

        {/* Calibrazione Manuale (Solo se attivata) */}
        <AnimatePresence>
          {isAdjustingCut && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center"
            >
              <div 
                className="absolute left-0 right-0 h-0.5 bg-white shadow-[0_0_20px_rgba(255,255,255,1)] flex items-center justify-center"
                style={{ top: `${cutLine}%` }}
              >
                <div className="bg-white text-black px-4 py-1 rounded-full text-[8px] font-black uppercase italic -mt-10 shadow-2xl">
                  Allinea questa linea alla parte superiore dei cerchi
                </div>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl">
                  <GripHorizontal size={20} className="text-black rotate-90" />
                </div>
              </div>
              
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 space-y-4">
                <Slider 
                  value={[cutLine]} 
                  min={30} max={85} step={0.1}
                  onValueChange={(val) => setCutLine(val[0])}
                />
                <Button 
                  onClick={() => setIsAdjustingCut(false)}
                  className="w-full bg-white text-black rounded-full font-black uppercase italic text-[10px] h-12"
                >
                  Conferma Calibrazione
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Controls */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none z-40">
          <div className="flex gap-2 pointer-events-auto">
            <button onClick={reset} className="p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black transition-all shadow-xl border border-white/10">
              <RotateCcw size={18} />
            </button>
            <button onClick={() => setIsAdjustingCut(true)} className="p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black transition-all shadow-xl border border-white/10">
              <Layers size={18} />
            </button>
          </div>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-white text-black rounded-full hover:scale-110 transition-all shadow-xl pointer-events-auto"
          >
            <Camera size={20} />
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500"><MoveVertical size={20} /></div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest italic">Assetto Virtuale</h4>
              <p className="text-[8px] font-bold uppercase text-zinc-600 tracking-widest">Regola l'altezza da terra</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-zinc-500" />
            <span className="text-2xl font-black italic text-white">-{Math.round(drop / 1.5)}mm</span>
          </div>
        </div>

        <div className="px-2">
          <Slider 
            value={[drop]} 
            max={150} 
            step={1} 
            onValueChange={(val) => setDrop(val[0])}
            className="py-4"
          />
          <div className="flex justify-between mt-4">
            <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Stock Height</span>
            <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Static as F*ck</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 pt-4">
        <Button 
          onClick={() => showSuccess("Simulazione salvata!")}
          className="bg-white text-black hover:bg-zinc-200 rounded-full h-16 px-12 font-black uppercase italic tracking-widest shadow-2xl transition-all border-none w-full sm:w-auto"
        >
          Salva Risultato
        </Button>
        <p className="text-[8px] font-black uppercase text-zinc-700 tracking-[0.3em] italic">
          Low District Visual Lab © 2026
        </p>
      </div>
    </div>
  );
};

export default LowLabSimulator;