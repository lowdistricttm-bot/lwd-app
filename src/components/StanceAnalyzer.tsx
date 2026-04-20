"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, ShieldCheck, Gauge, Info, Share2, X } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from "@/integrations/supabase/client";
import { showError } from '@/utils/toast';

const StanceAnalyzer = ({ imageUrl, onClose }: { imageUrl: string, onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyze = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('https://cxjqbxhhslxqpkfcwqhr.supabase.co/functions/v1/analyze-stance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ imageUrl })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center p-6">
      <div className="flex justify-between w-full mb-8">
        <h3 className="text-xl font-black italic uppercase tracking-tighter">AI Stance Analyzer</h3>
        <button onClick={onClose} className="p-2 bg-white/5 rounded-full"><X size={20} /></button>
      </div>

      <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden border border-white/10 mb-8 bg-black">
        <img src={imageUrl} className="w-full h-full object-cover opacity-60" alt="Auto" />
        {loading && (
          <motion.div 
            initial={{ top: 0 }} animate={{ top: '100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-1 bg-white shadow-[0_0_20px_white] z-10"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          {!result && !loading && (
            <Button onClick={analyze} className="bg-white text-black rounded-full h-14 px-10 font-black uppercase italic shadow-2xl">
              <Sparkles size={18} className="mr-2" /> Inizia Scansione
            </Button>
          )}
          {loading && <Loader2 className="animate-spin text-white" size={48} />}
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-8">
            <div className="bg-white text-black p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12"><Gauge size={120} /></div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2">Stance Score</p>
              <h4 className="text-7xl font-black italic tracking-tighter leading-none mb-4">{result.stance_score}</h4>
              <p className="text-xs font-bold uppercase italic leading-relaxed px-4">"{result.comment}"</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Wheel Gap', val: result.wheel_gap },
                { label: 'Camber', val: result.camber },
                { label: 'Fitment', val: result.fitment_type }
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <p className="text-[7px] font-black uppercase text-zinc-500 mb-1">{item.label}</p>
                  <p className="text-xs font-black italic text-white">{item.val}</p>
                </div>
              ))}
            </div>

            <Button className="w-full bg-white/10 border border-white/10 rounded-full h-14 font-black uppercase italic">
              <Share2 size={18} className="mr-2" /> Condividi Risultato
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StanceAnalyzer;