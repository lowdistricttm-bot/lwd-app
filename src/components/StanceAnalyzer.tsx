"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Gauge, Share2, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from '@/utils/toast';
import { useGarage } from '@/hooks/use-garage';
import { cn } from '@/lib/utils';

const StanceAnalyzer = ({ imageUrl, vehicleId, onClose }: { imageUrl: string, vehicleId: string, onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { updateStanceScore } = useGarage();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

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
      }, 3500);

    } catch (err: any) {
      showError(err.message);
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!currentUserId || !result) return;

    const shareUrl = `${window.location.origin}/profile/${currentUserId}?tab=garage`;
    const shareData = {
      title: 'Low District Stance Score',
      text: `Il mio progetto ha ottenuto un Low Score di ${result.stance_score}! Scoprilo nel mio Garage su Low District.`,
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showSuccess("Link del profilo copiato!");
      }
    } catch (err) {
      console.error('Errore condivisione:', err);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh] overflow-y-auto no-scrollbar relative bg-zinc-950">
      {/* Header */}
      <div className="p-6 md:p-8 flex justify-between items-center sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md">
        <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter whitespace-nowrap">
          Low Score Analyzer
        </h3>
        <button 
          onClick={onClose} 
          className="p-2.5 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors ml-4"
        >
          <X size={20} />
        </button>
      </div>

      <div className="px-6 md:px-8 pb-10 space-y-8">
        {/* Immagine con Scansione */}
        <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden border border-white/10 bg-black shadow-2xl">
          <img 
            src={imageUrl} 
            className={cn(
              "w-full h-full object-cover transition-all duration-1000", 
              loading ? "opacity-60 scale-105" : result ? "opacity-40" : "opacity-70"
            )} 
            alt="Auto" 
          />
          
          <AnimatePresence>
            {loading && (
              <>
                {/* Laser Scanner Bar */}
                <motion.div 
                  initial={{ top: "0%" }}
                  animate={{ top: "100%" }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute left-0 right-0 h-1 bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] z-20"
                />
                {/* Overlay Scansione */}
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/5 backdrop-blur-[2px] z-10"
                />
                <div className="absolute inset-0 flex items-center justify-center z-30">
                  <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 flex items-center gap-3">
                    <Loader2 className="animate-spin text-white" size={18} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Analisi in corso...</span>
                  </div>
                </div>
              </>
            )}
          </AnimatePresence>

          {!result && !loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button onClick={analyze} className="bg-white text-black rounded-full h-14 px-10 font-black uppercase italic shadow-2xl hover:scale-105 transition-all border-none">
                <Sparkles size={18} className="mr-2" /> Inizia Scansione
              </Button>
            </div>
          )}
        </div>

        {/* Risultati del Report */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="space-y-8"
            >
              <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 opacity-5 rotate-12 text-white"><Gauge size={180} /></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="text-center md:text-left flex-1">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <ShieldCheck size={12} className="text-zinc-500" />
                      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Official Low Score</p>
                    </div>
                    <h4 className="text-7xl md:text-8xl font-black italic tracking-tighter leading-none mb-4 text-white">{result.stance_score}</h4>
                    <p className="text-xs font-black uppercase italic leading-relaxed text-zinc-400 max-w-md">
                      "{result.comment}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2 w-full md:w-56">
                    {[
                      { label: 'Wheel Gap', val: result.wheel_gap },
                      { label: 'Camber', val: result.camber },
                      { label: 'Fitment', val: result.fitment_type }
                    ].map((item, i) => (
                      <div key={i} className="bg-white/5 border border-white/5 p-3.5 rounded-2xl flex justify-between items-center">
                        <p className="text-[7px] font-black uppercase text-zinc-500 tracking-widest">{item.label}</p>
                        <p className="text-[10px] font-black italic text-white">{item.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleShare}
                  className="flex-1 bg-white/5 border border-white/10 rounded-full h-14 font-black uppercase italic text-[10px] tracking-widest hover:bg-white/10 transition-all"
                >
                  <Share2 size={16} className="mr-2" /> Condividi
                </Button>
                <Button onClick={onClose} className="flex-1 bg-white text-black rounded-full h-14 font-black uppercase italic text-[10px] tracking-widest shadow-xl hover:bg-zinc-200 transition-all">
                  <CheckCircle2 size={16} className="mr-2" /> Chiudi Report
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