"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Gauge, Share2, X, Terminal, CheckCircle2 } from 'lucide-react';
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
      
      // Aspettiamo che l'animazione dei log finisca prima di mostrare il risultato
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
    <div className="flex flex-col items-center text-center p-6">
      <div className="flex justify-between w-full mb-8">
        <div className="text-left">
          <h3 className="text-xl font-black italic uppercase tracking-tighter">Low Score Analyzer</h3>
          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">AI Powered Stance Evaluation</p>
        </div>
        <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><X size={20} /></button>
      </div>

      <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden border border-white/10 mb-8 bg-black shadow-2xl">
        <img src={imageUrl} className={cn("w-full h-full object-cover transition-all duration-1000", loading ? "opacity-40 scale-110 blur-sm" : "opacity-60")} alt="Auto" />
        
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
            >
              <div className="w-full max-w-xs bg-black/80 border border-white/10 rounded-xl p-4 font-mono text-left shadow-2xl">
                <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                  <Terminal size={12} className="text-zinc-500" />
                  <span className="text-[8px] text-zinc-500 uppercase font-bold">System Analysis Log</span>
                </div>
                <div className="space-y-1.5">
                  {SCAN_STEPS.slice(0, currentStep + 1).map((step, i) => (
                    <motion.p 
                      key={i} 
                      initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                      className="text-[9px] text-white flex items-center gap-2"
                    >
                      <span className="text-green-500">{">"}</span> {step}
                    </motion.p>
                  ))}
                </div>
                <div className="mt-4 flex justify-center">
                  <Loader2 className="animate-spin text-white/20" size={24} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!result && !loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button onClick={analyze} className="bg-white text-black rounded-full h-14 px-10 font-black uppercase italic shadow-2xl hover:scale-105 transition-all">
              <Sparkles size={18} className="mr-2" /> Inizia Scansione
            </Button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-8">
            <div className="bg-white text-black p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12"><Gauge size={120} /></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2">Low Score Ufficiale</p>
                <h4 className="text-7xl font-black italic tracking-tighter leading-none mb-4">{result.stance_score}</h4>
                <div className="w-12 h-1 bg-black/10 mx-auto mb-4 rounded-full" />
                <p className="text-xs font-bold uppercase italic leading-relaxed px-4 text-zinc-800">"{result.comment}"</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Wheel Gap', val: result.wheel_gap },
                { label: 'Camber', val: result.camber },
                { label: 'Fitment', val: result.fitment_type }
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                  <p className="text-[7px] font-black uppercase text-zinc-500 mb-1 tracking-widest">{item.label}</p>
                  <p className="text-[10px] font-black italic text-white">{item.val}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 bg-white/10 border border-white/10 rounded-full h-14 font-black uppercase italic text-[10px] tracking-widest hover:bg-white/20 transition-all">
                <Share2 size={16} className="mr-2" /> Condividi
              </Button>
              <Button onClick={onClose} className="flex-1 bg-white text-black rounded-full h-14 font-black uppercase italic text-[10px] tracking-widest shadow-xl">
                <CheckCircle2 size={16} className="mr-2" /> Chiudi Report
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StanceAnalyzer;