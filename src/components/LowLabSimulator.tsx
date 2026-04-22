"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MoveVertical, RotateCcw, Download, Plus, Trash2, Layers, Check, GripHorizontal, SlidersHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

interface WheelOverlay {
  id: string;
  url: string;
  x: number;
  y: number;
  scale: number;
}

const WHEEL_OPTIONS = [
  { id: 'bbs-rs', name: 'BBS RS', url: 'https://www.lowdistrict.it/wp-content/uploads/bbs-rs-wheel.png' },
  { id: 'rotiform-tmb', name: 'Rotiform TMB', url: 'https://www.lowdistrict.it/wp-content/uploads/rotiform-wheel.png' },
  { id: 'work-meister', name: 'Work Meister', url: 'https://www.lowdistrict.it/wp-content/uploads/work-wheel.png' },
  { id: 'oz-futura', name: 'OZ Futura', url: 'https://www.lowdistrict.it/wp-content/uploads/oz-wheel.png' }
];

const LowLabSimulator = () => {
  const [image, setImage] = useState<string | null>(null);
  const [drop, setDrop] = useState(0);
  const [cutLine, setCutLine] = useState(60); // Percentuale dall'alto
  const [isAdjustingCut, setIsAdjustingCut] = useState(false);
  const [wheels, setWheels] = useState<WheelOverlay[]>([]);
  const [selectedWheelId, setSelectedWheelId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setDrop(0);
      setWheels([]);
    }
  };

  const addWheel = (url: string) => {
    const newWheel: WheelOverlay = {
      id: Math.random().toString(36).substr(2, 9),
      url,
      x: 50,
      y: 70,
      scale: 0.2
    };
    setWheels([...wheels, newWheel]);
    setSelectedWheelId(newWheel.id);
  };

  const updateWheel = (id: string, updates: Partial<WheelOverlay>) => {
    setWheels(wheels.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const removeWheel = (id: string) => {
    setWheels(wheels.filter(w => w.id !== id));
    setSelectedWheelId(null);
  };

  const reset = () => {
    setDrop(0);
    setWheels([]);
    setSelectedWheelId(null);
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
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Foto laterale consigliata</p>
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
        {/* Layer 1: Static Background (Wheels & Ground) */}
        <img src={image} className="absolute inset-0 w-full h-full object-contain opacity-40 blur-[2px]" alt="" />

        {/* Layer 2: Moving Body */}
        <div 
          className="absolute inset-0 w-full h-full transition-transform duration-300 ease-out"
          style={{ 
            transform: `translateY(${drop}px)`,
            clipPath: `inset(0 0 ${100 - cutLine}% 0)` 
          }}
        >
          <img src={image} className="w-full h-full object-contain" alt="Car Body" />
        </div>

        {/* Layer 3: Static Bottom (to keep wheels in place if not using overlays) */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{ clipPath: `inset(${cutLine}% 0 0 0)` }}
        >
          <img src={image} className="w-full h-full object-contain" alt="Car Wheels" />
        </div>

        {/* Wheel Overlays */}
        {wheels.map((w) => (
          <motion.div
            key={w.id}
            drag
            dragMomentum={false}
            onDrag={(_, info) => {
              // Logica per aggiornare x e y basata sul trascinamento
            }}
            onClick={() => setSelectedWheelId(w.id)}
            className={cn(
              "absolute z-30 cursor-grab active:cursor-grabbing",
              selectedWheelId === w.id && "ring-2 ring-white ring-offset-4 ring-offset-black rounded-full"
            )}
            style={{ 
              left: `${w.x}%`, 
              top: `${w.y}%`, 
              width: `${w.scale * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <img src={w.url} className="w-full h-full object-contain drop-shadow-2xl" alt="Wheel" />
          </motion.div>
        ))}

        {/* Cut Line Adjustment Overlay */}
        <AnimatePresence>
          {isAdjustingCut && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center"
            >
              <div 
                className="absolute left-0 right-0 h-0.5 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] flex items-center justify-center"
                style={{ top: `${cutLine}%` }}
              >
                <div className="bg-white text-black px-4 py-1 rounded-full text-[8px] font-black uppercase italic -mt-8">
                  Linea di Taglio (Sopra i cerchi)
                </div>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-xl cursor-ns-resize">
                  <GripHorizontal size={16} className="text-black rotate-90" />
                </div>
              </div>
              <Button 
                onClick={() => setIsAdjustingCut(false)}
                className="mt-32 bg-white text-black rounded-full font-black uppercase italic text-[10px] px-8"
              >
                Conferma Posizione
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls Overlay (Floating) */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lowering Control */}
        <div className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500"><MoveVertical size={20} /></div>
              <h4 className="text-xs font-black uppercase tracking-widest italic">Assetto Virtuale</h4>
            </div>
            <span className="text-2xl font-black italic text-white">-{drop}mm</span>
          </div>

          <div className="px-2">
            <Slider 
              value={[drop]} 
              max={100} 
              step={1} 
              onValueChange={(val) => setDrop(val[0])}
              className="py-4"
            />
            <div className="flex justify-between mt-4">
              <span className="text-[8px] font-black uppercase text-zinc-600">Stock Height</span>
              <span className="text-[8px] font-black uppercase text-zinc-600">Frame Bangin'</span>
            </div>
          </div>
        </div>

        {/* Wheel Selector */}
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500"><Plus size={20} /></div>
            <h4 className="text-xs font-black uppercase tracking-widest italic">Wheel Shop</h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {WHEEL_OPTIONS.map((wheel) => (
              <button 
                key={wheel.id}
                onClick={() => addWheel(wheel.url)}
                className="aspect-square bg-black/40 border border-white/5 rounded-2xl p-3 hover:border-white/20 transition-all group relative overflow-hidden"
              >
                <img src={wheel.url} className="w-full h-full object-contain group-hover:scale-110 transition-transform" alt={wheel.name} />
                <div className="absolute inset-x-0 bottom-0 bg-black/80 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[7px] font-black uppercase text-center">{wheel.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Wheel Controls */}
      <AnimatePresence>
        {selectedWheelId && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="bg-white text-black p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center gap-8"
          >
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl">
                <SlidersHorizontal size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black italic uppercase tracking-tight">Edit Wheel</h4>
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Regola dimensioni e posizione</p>
              </div>
            </div>

            <div className="flex-1 w-full space-y-6">
              <div className="flex items-center gap-6">
                <span className="text-[8px] font-black uppercase text-zinc-400 w-12">Scale</span>
                <Slider 
                  value={[wheels.find(w => w.id === selectedWheelId)?.scale || 0.2]} 
                  min={0.05} max={0.5} step={0.01}
                  onValueChange={(val) => updateWheel(selectedWheelId, { scale: val[0] })}
                />
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[8px] font-black uppercase text-zinc-400 w-12">Pos Y</span>
                <Slider 
                  value={[wheels.find(w => w.id === selectedWheelId)?.y || 70]} 
                  min={0} max={100} step={0.5}
                  onValueChange={(val) => updateWheel(selectedWheelId, { y: val[0] })}
                />
              </div>
            </div>

            <div className="flex gap-3 shrink-0">
              <Button 
                onClick={() => removeWheel(selectedWheelId)}
                variant="destructive"
                className="w-12 h-12 rounded-full p-0 flex items-center justify-center shadow-xl"
              >
                <Trash2 size={18} />
              </Button>
              <Button 
                onClick={() => setSelectedWheelId(null)}
                className="bg-black text-white hover:bg-zinc-800 rounded-full h-12 px-8 font-black uppercase italic text-[10px] shadow-xl"
              >
                <Check size={18} className="mr-2" /> Fatto
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-center pt-4">
        <Button 
          onClick={() => showSuccess("Screenshot salvato nel rullino!")}
          className="bg-white text-black hover:bg-zinc-200 rounded-full h-16 px-12 font-black uppercase italic tracking-widest shadow-2xl transition-all border-none"
        >
          <Download size={20} className="mr-3" /> Salva Risultato
        </Button>
      </div>
    </div>
  );
};

export default LowLabSimulator;