"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MoveVertical, RotateCcw, Download, Layers, GripHorizontal, Info, Sparkles, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

const LowLabSimulator = () => {
  const [image, setImage] = useState<string | null>(null);
  const [drop, setDrop] = useState(0);
  const [cutLine, setCutLine] = useState(62); // Punto di taglio ideale (sopra i cerchi)
  const [isAdjustingCut, setIsAdjustingCut] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setDrop(0);
      // Al caricamento, attiviamo la calibrazione per far capire all'utente come allineare
      setIsAdjustingCut(true);
    }
  };

  const reset = () => {
    setDrop(0);
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
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Usa una foto di profilo laterale</p>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Simulator Canvas */}
      <div className="relative aspect-video md:aspect-[21/9] bg-zinc-950 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl touch-none">
        
        {/* LAYER 1: RUOTE E TERRA (STATICO) */}
        {/* Questo layer non si muove mai, garantendo che le ruote rimangano perfette */}
        <div 
          className="absolute inset-0 w-full h-full z-0"
          style={{ clipPath: `inset(${cutLine}% 0 0 0)` }}
        >
          <img src={image} className="w-full h-full object-contain" alt="Static Wheels" />
        </div>

        {/* LAYER 2: CARROZZERIA (MOBILE) */}
        {/* Questo layer scende e copre le ruote statiche, creando l'effetto tuck */}
        <motion.div 
          className="absolute inset-0 w-full h-full z-20 pointer-events-none"
          animate={{ y: drop }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          style={{ clipPath: `inset(0 0 ${100 - cutLine}% 0)` }}
        >
          <img src={image} className="w-full h-full object-contain" alt="Moving Body" />
          
          {/* Ombra dinamica sotto il passaruota */}
          <div 
            className="absolute inset-x-0 bottom-0 h-12 pointer-events-none transition-opacity duration-500"
            style={{ 
              top: `${cutLine}%`,
              opacity: drop > 0 ? (drop / 100) + 0.2 : 0,
              background: `linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)`
            }}
          />
        </motion.div>

        {/* Overlay di Calibrazione */}
        <AnimatePresence>
          {isAdjustingCut && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center"
            >
              <div 
                className="absolute left-0 right-0 h-0.5 bg-white shadow-[0_0_20px_rgba(255,255,255,1)] flex items-center justify-center"
                style={{ top: `${cutLine}%` }}
              >
                <div className="bg-white text-black px-4 py-1.5 rounded-full text-[8px] font-black uppercase italic -mt-12 shadow-2xl flex items-center gap-2">
                  <GripHorizontal size={12} /> Allinea al bordo del passaruota
                </div>
              </div>
              
              <div className="absolute bottom-12 left-6 right-6 max-w-md mx-auto space-y-6">
                <div className="bg-zinc-900/80 p-6 rounded-[2rem] border border-white/10">
                  <p className="text-[9px] font-black uppercase text-zinc-500 mb-4 text-center tracking-widest">Regola Altezza Taglio</p>
                  <Slider 
                    value={[cutLine]} 
                    min={20} max={85} step={0.1}
                    onValueChange={(val) => setCutLine(val[0])}
                  />
                </div>
                <Button 
                  onClick={() => setIsAdjustingCut(false)}
                  className="w-full bg-white text-black rounded-full font-black uppercase italic text-[10px] h-14 shadow-2xl"
                >
                  <Check size={18} className="mr-2" /> Conferma Calibrazione
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
              <p className="text-[8px] font-bold uppercase text-zinc-600 tracking-widest">Scivola sopra le ruote</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-zinc-500" />
            <span className="text-2xl font-black italic text-white">-{Math.round(drop / 1.2)}mm</span>
          </div>
        </div>

        <div className="px-2">
          <Slider 
            value={[drop]} 
            max={120} 
            step={1} 
            onValueChange={(val) => setDrop(val[0])}
            className="py-4"
          />
          <div className="flex justify-between mt-4">
            <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Stock</span>
            <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Tucked</span>
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