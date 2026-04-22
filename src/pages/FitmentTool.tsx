"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FitmentCalculator from '@/components/FitmentCalculator';
import { ChevronLeft, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const FitmentTool = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white flex flex-col bg-transparent">
      <Navbar />
      
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top)+2rem)] pb-32 px-6 max-w-lg mx-auto w-full">
        <header className="mb-10">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 uppercase text-[10px] font-black tracking-widest transition-colors"
          >
            <ChevronLeft size={16} /> Torna Indietro
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl rotate-12">
              <ArrowRightLeft size={20} className="-rotate-12" />
            </div>
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] italic">Garage Tools</h2>
          </div>
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase">Fitment Calculator</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 leading-relaxed mt-4">
            Calcola lo spostamento millimetrico dei tuoi nuovi cerchi. Inserisci canale ed ET per visualizzare il cambiamento di sporgenza e ingombro interno.
          </p>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <FitmentCalculator />
        </motion.div>
      </main>
    </div>
  );
};

export default FitmentTool;