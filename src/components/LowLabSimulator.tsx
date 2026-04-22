"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MoveVertical, RotateCcw, Download, Sparkles, Loader2, ShieldCheck, Gauge } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

const LowLabSimulator = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [drop, setDrop] = useState(0);
  
  // Parametri calcolati automaticamente dallo "Smart Detection"
  const [autoParams, setAutoParams] = useState({
    cutLine: 63,
    shadowIntensity: 0.4
  });
  
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
    // Simuliamo l'analisi AI dei passaruota e della linea di terra
    setTimeout(() => {
      setAutoParams({
        cutLine: 62.5, // Punto di equilibrio perfetto per la maggior parte delle foto laterali
        shadowIntensity: 0.6
      });
      setIsAnalyzing(false);
      showSuccess("Assetto analizzato correttamente!");
    }, 2500);
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
        
        {/* LAYER 1: RUOTE E SFONDO (STATICO) */}
        <div className="absolute inset-0 w-full h-full z-0">
          <img src={image} className="w-full h-full object-contain opacity-40 blur-[2px]" alt="" />
          {/* Maschera per tenere solo la parte inferiore (ruote) */}
          <div 
            className="absolute inset-0 w-full h-full"
            style={{ 
              backgroundImage: `url(${image})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              clipPath: `inset(${autoParams.cutLine}% 0 0 0)`
            }}
          />
        </div>

        {/* LAYER 2: CARROZZERIA (MOBILE) */}
        <motion.div 
          className="absolute inset-0 w-full h-full z-20 pointer-events-none"
          animate={{ y: drop }}
          transition={{ type: 'spring', damping: 28, stiffness: 100 }}
        >
          <div 
            className="w-full h-full relative"
            style={{ 
              backgroundImage: `url(${image})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              // Tagliamo la carrozzeria e applichiamo una sfumatura sul bordo inferiore
              // per farla scivolare realisticamente sopra le ruote
              WebkitMaskImage: `linear-gradient(to bottom, black ${autoParams.cutLine - 5}%, transparent ${autoParams.cutLine + 2}%)`,
              maskImage: `linear-gradient(to bottom, black ${autoParams.cutLine - 5}%, transparent ${autoParams.cutLine + 2}%)`
            }}
          />
          
          {/* Ombra dinamica del passaruota che segue il movimento */}
          <div 
            className="absolute inset-x-0 h-20 pointer-events-none transition-opacity duration-500"
            style={{ 
              top: `${autoParams.cutLine - 2}%`,
              opacity: drop > 0 ? (drop / 120) * autoParams.shadowIntensity : 0,
              background: `linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%)`
            }}
          />
        </motion.div>

        {/* Overlay Analisi AI */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center"
            >
              <div className="relative mb-6">
                <Loader2 className="animate-spin text-white" size={48} />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50" size={20} />
              </div>
              <h4 className="text-sm font-black uppercase italic tracking-[0.3em]">Smart Detection...</h4>
              <p className="text-[8px] font-bold uppercase text-zinc-500 mt-2 tracking-widest">Identificazione passaruota e fitment</p>
              
              {/* Laser Scan Effect */}
              <motion.div 
                initial={{ top: '20%' }} animate={{ top: '80%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-0.5 bg-white/50 shadow-[0_0_15px_rgba(255,255,255,0.8)]"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Controls */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none z-40">
          <button onClick={reset} className="p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black transition-all shadow-xl border border-white/10 pointer-events-auto">
            <RotateCcw size={18} />
          </button>
          
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
            <div className="w-10 h-10 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500"><Gauge size={20} /></div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest italic">Assetto Virtuale</h4>
              <p className="text-[8px] font-bold uppercase text-zinc-600 tracking-widest">AI Optimized Fitment</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={12} className="text-green-500" />
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
            <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Stock Height</span>
            <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Perfect Tuck</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 pt-4">
        <Button 
          onClick={() => showSuccess("Simulazione salvata!")}
          className="bg-white text-black hover:bg-zinc-200 rounded-full h-16 px-12 font-black uppercase italic tracking-widest shadow-2xl transition-all border-none w-full sm:w-auto"
        >
          <Download size={20} className="mr-3" /> Salva Risultato
        </Button>
        <p className="text-[8px] font-black uppercase text-zinc-700 tracking-[0.3em] italic">
          Low District Visual Lab © 2026
        </p>
      </div>
    </div>
  );
};

export default LowLabSimulator;