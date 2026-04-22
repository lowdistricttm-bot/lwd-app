"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import LowLabSimulator from '@/components/LowLabSimulator';
import { ChevronLeft, Sparkles, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const LowLab = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white flex flex-col bg-transparent">
      <Navbar />
      
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top)+2rem)] pb-32 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <header className="mb-10">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 uppercase text-[10px] font-black tracking-widest transition-colors"
          >
            <ChevronLeft size={16} /> Torna Indietro
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl rotate-12">
              <Sparkles size={20} className="-rotate-12" />
            </div>
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] italic">Visual Lab</h2>
          </div>
          <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase">LowLab Simulator</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-4 max-w-xl leading-relaxed">
            Visualizza il futuro del tuo progetto. Carica una foto laterale, regola l'altezza e prova nuovi cerchi prima di toccare un bullone.
          </p>
        </header>

        <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] flex items-start gap-4 mb-10">
          <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center shrink-0"><Info size={20} className="text-zinc-400" /></div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white italic">Consiglio Tecnico</h4>
            <p className="text-[9px] text-zinc-500 font-bold uppercase leading-relaxed italic">
              Per un risultato ottimale, usa una foto scattata perfettamente di lato (profilo) e con una buona illuminazione sui passaruota.
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <LowLabSimulator />
        </motion.div>
      </main>
    </div>
  );
};

export default LowLab;