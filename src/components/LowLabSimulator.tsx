"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MoveVertical, RotateCcw, Download, Sparkles, Loader2, ShieldCheck, Gauge, Zap, Target } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

const LowLabSimulator = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [drop, setDrop] = useState(0);
  
  // Parametri di calibrazione automatica (3DTuning Style)
  const [params, setParams] = useState({
    frontWheelX: 28,
    rearWheelX: 72,
    wheelY: 66,
    wheelSize: 22, // Diametro dell'area "ruota"
    shadowSoftness: 15
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      setDrop(0);
      startAIPositioning();
    }
  };

  const startAIPositioning = () => {
    setIsAnalyzing(true);
    // Simuliamo il riconoscimento del telaio e dei centri ruota
    setTimeout(() => {
      setIsAnalyzing(false);
      showSuccess("Assetto calibrato: 3D Mapping completato.");
    }, 3000);
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
        <h3 className="text-xl font-black italic uppercase tracking-tight mb-2">Carica Progetto</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Analisi automatica prospettiva laterale</p>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Simulator Canvas - Technical UI */}
      <div className="relative aspect-video md:aspect-[21/9] bg-black rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl touch-none group/canvas">
        
        {/* BACKGROUND LAYER: RUOTE STATICHE */}
        <div className="absolute inset-0 w-full h-full z-0 opacity-100">
          <img src={image} className="w-full h-full object-contain" alt="Original" />
        </div>

        {/* FOREGROUND LAYER: CARROZZERIA MOBILE */}
        <motion.div 
          className="absolute inset-0 w-full h-full z-20"
          animate={{ y: drop }}
          transition={{ type: 'spring', damping: 30, stiffness: 100 }}
          style={{ 
            // La magia: maschera che nasconde i cerchi nella carrozzeria che scende
            // permettendo ai cerchi del layer sotto di restare visibili e fissi.
            WebkitMaskImage: `radial-gradient(circle ${params.wheelSize}% at ${params.frontWheelX}% ${params.wheelY}%, transparent 80%, black 100%), 
                             radial-gradient(circle ${params.wheelSize}% at ${params.rearWheelX}% ${params.wheelY}%, transparent 80%, black 100%)`,
            maskImage: `radial-gradient(circle ${params.wheelSize}% at ${params.frontWheelX}% ${params.wheelY}%, transparent 80%, black 100%), 
                        radial-gradient(circle ${params.wheelSize}% at ${params.rearWheelX}% ${params.wheelY}%, transparent 80%, black 100%)`,
            WebkitMaskComposite: 'destination-in',
            maskComposite: 'intersect'
          }}
        >
          <img src={image} className="w-full h-full object-contain" alt="Body" />
        </motion.div>

        {/* EFFETTO OMBRA PASSARUOTA (DINAMICO) */}
        <motion.div 
          className="absolute inset-0 z-30 pointer-events-none"
          animate={{ opacity: drop > 0 ? (drop / 150) : 0 }}
          style={{ 
            background: `radial-gradient(circle ${params.wheelSize}% at ${params.frontWheelX}% ${params.wheelY}%, rgba(0,0,0,0.8) 0%, transparent 70%), 
                         radial-gradient(circle ${params.wheelSize}% at ${params.rearWheelX}% ${params.wheelY}%, rgba(0,0,0,0.8) 0%, transparent 70%)`
          }}
        />

        {/* Overlay Analisi AI - 3DTuning Style */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 animate-ping bg-white/20 rounded-full" />
                <Target className="text-white relative animate-pulse" size={64} strokeWidth={1} />
              </div>
              <div className="space-y-2 text-center">
                <h4 className="text-sm font-black uppercase italic tracking-[0.4em]">Automated Detection</h4>
                <p className="text-[8px] font-bold uppercase text-zinc-500 tracking-widest flex items-center justify-center gap-2">
                   <Loader2 size={10} className="animate-spin" /> MAPPING WHEEL COORDINATES...
                </p>
              </div>
              
              {/* Scanner Grid Line */}
              <motion.div 
                initial={{ left: '10%' }} animate={{ left: '90%' }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 bottom-0 w-[1px] bg-white/30 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Technical Info */}
        <div className="absolute top-6 left-6 z-40 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-[8px] font-black uppercase text-zinc-500 tracking-widest">
              <Zap size={10} className="text-yellow-500" /> System Status
            </div>
            <p className="text-[10px] font-black italic uppercase text-white">Active Simulation</p>
          </div>
        </div>

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

      {/* Control Panel - Technical Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500"><Gauge size={20} /></div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest italic">Height Adjustment</h4>
                <p className="text-[8px] font-bold uppercase text-zinc-600 tracking-widest">Millimetric Precision Control</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Low Index</p>
              <span className="text-3xl font-black italic text-white">-{Math.round(drop / 1.5)}<span className="text-xs ml-1">mm</span></span>
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
              <span className="text-[8px] font-black uppercase text-zinc-700 tracking-widest">OEM Spec</span>
              <span className="text-[8px] font-black uppercase text-zinc-700 tracking-widest">Ground Zero</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex flex-col justify-center gap-6">
          <div className="space-y-1">
            <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Fitment Type</p>
            <h4 className="text-xl font-black italic uppercase text-white">
              {drop > 100 ? 'Hardcore Tuck' : drop > 50 ? 'Flush Fit' : 'Mild Drop'}
            </h4>
          </div>
          <div className="h-[1px] bg-white/10 w-full" />
          <Button 
            onClick={() => showSuccess("Configurazione salvata!")}
            className="bg-white text-black hover:bg-zinc-200 rounded-full h-14 font-black uppercase italic text-[10px] tracking-widest shadow-2xl transition-all border-none"
          >
            <Download size={16} className="mr-2" /> Export Config
          </Button>
        </div>
      </div>

      <div className="text-center">
        <p className="text-[7px] font-black uppercase text-zinc-800 tracking-[0.5em] italic">
          Powered by Low District Visual Intelligence Lab • 2026
        </p>
      </div>
    </div>
  );
};

export default LowLabSimulator;