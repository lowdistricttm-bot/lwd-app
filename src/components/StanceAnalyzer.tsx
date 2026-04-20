"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Gauge, Share2, X, Terminal, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from "@/integrations/supabase/client";
import { showError } from '@/utils/toast';
import { useGarage } from '@/hooks/use-garage';
import { cn } from '@/lib/utils';

const SCAN_STEPS = [
  "Inizializzazione sensori ottici...",
  "Rilevamento archi passaruota...",
  "Calcolo luce a terra (Ground Clearance)...",
  "Analisi angoli di Camber...",
  "Verifica Offset e Fitment...",
  "Elaborazione Low Score finale..."
];

const StanceAnalyzer = ({ imageUrl, vehicleId, onClose }: { imageUrl: string, vehicleId: string, onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const { updateStanceScore } = useGarage();

  useEffect(() => {
    let interval: any;
    if (loading && currentStep < SCAN_STEPS.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [loading, currentStep]);

  const analyze = async () => {
    setLoading(true);
    setCurrentStep(0);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('https://cxjqbxhhslxqpkfcwqhr.supabase.co/functions/v1/analyze-stance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ imageUrl, vehicleId })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setTimeout(async () => {
        setResult(data);
        if (data.stance_score) {
          await updateStanceScore.mutateAsync({ 
            vehicleId, 
            score: parseInt(data.stance_score) 
          });
        }
        setLoading(false);
      }, 1000);

    } catch (err: any) {
      showError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[80vh] relative">
      {/* Close Button - Always Fixed Top Right */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 z-[100] p-3 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-white hover:text-black transition-all shadow-2xl border border-white/10"
      >
        <X size={24} />
      </button>

      <div className={cn(
        "flex-1 flex flex-col p-6 md:p-10 transition-all duration-700",
        result ? "bg-black" : ""
      )}>
        <div className="text-left mb-8 pr-16">
          <h3 className="text-2xl font-black italic uppercase tracking-tighter">Low Score Analyzer</h3>
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">AI Visual Stance Evaluation</p>
        </div>

        <div className={cn(
          "relative w-full rounded-[2.5rem] overflow-hidden border border-white/10 bg-black shadow-2xl transition-all duration-1000",
          result ? "aspect-[21/9] mb-10" : "aspect-video mb-8"
        )}>
          <img src={imageUrl} className={cn("w-full h-full object-cover transition-all duration-1000", loading ? "opacity-40 scale-110 blur-sm" : result ? "opacity-50" : "opacity-70")} alt="Auto" />
          
          <AnimatePresence>
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
              >
                <div className="w-full max-w-xs bg-black/80 border border-white/10 rounded-2xl p-6 font-mono text-left shadow-2xl">
                  <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                    <Terminal size={14} className="text-zinc-500" />
                    <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Visual Analysis Log</span>
                  </div>
                  <div className="space-y-2">
                    {SCAN_STEPS.slice(0, currentStep + 1).map((step, i) => (
                      <motion.p 
                        key={i} 
                        initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                        className="text-[10px] text-white flex items-center gap-2"
                      >
                        <span className="text-green-500 font-bold">{">"}</span> {step}
                      </motion.p>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-center">
                    <Loader2 className="animate-spin text-white/20" size={28} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!result && !loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button onClick={analyze} className="bg-white text-black rounded-full h-16 px-12 font-black uppercase italic shadow-2xl hover:scale-105 transition-all border-none">
                <Sparkles size={20} className="mr-3" /> Inizia Analisi Visiva
              </Button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {result && !loading && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="w-full space-y-10 animate-in fade-in duration-1000"
            >
              <div className="bg-white text-black p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
                <div className="absolute -right-10 -bottom-10 opacity-5 rotate-12"><Gauge size={240} /></div>
                
                <div className="relative z-10 text-center md:text-left flex-1">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                    <ShieldCheck size={14} className="text-zinc-400" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Official Low Score</p>
                  </div>
                  <h4 className="text-8xl md:text-9xl font-black italic tracking-tighter leading-none mb-6">{result.stance_score}</h4>
                  <div className="w-20 h-1.5 bg-black rounded-full mb-6 hidden md:block" />
                  <p className="text-sm md:text-base font-black uppercase italic leading-tight text-zinc-800 max-w-md">
                    "{result.comment}"
                  </p>
                </div>

                <div className="relative z-10 grid grid-cols-1 gap-3 w-full md:w-64">
                  {[
                    { label: 'Wheel Gap', val: result.wheel_gap },
                    { label: 'Camber', val: result.camber },
                    { label: 'Fitment', val: result.fitment_type }
                  ].map((item, i) => (
                    <div key={i} className="bg-black/5 border border-black/5 p-4 rounded-2xl flex justify-between items-center">
                      <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">{item.label}</p>
                      <p className="text-[11px] font-black italic text-black">{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pb-10">
                <Button className="flex-1 bg-white/5 border border-white/10 rounded-full h-16 font-black uppercase italic text-[11px] tracking-widest hover:bg-white/10 transition-all">
                  <Share2 size={18} className="mr-3" /> Condividi Risultato
                </Button>
                <Button onClick={onClose} className="flex-1 bg-white text-black rounded-full h-16 font-black uppercase italic text-[11px] tracking-widest shadow-2xl hover:bg-zinc-200 transition-all">
                  <CheckCircle2 size={18} className="mr-3" /> Chiudi Report
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StanceAnalyzer;