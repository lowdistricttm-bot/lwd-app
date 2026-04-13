"use client";

import React from 'react';
import { motion } from 'framer-motion';
import WordPressPortal from '@/components/WordPressPortal';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header di Presentazione */}
      <div className="relative h-[40vh] flex flex-col items-center justify-center px-6 overflow-hidden border-b border-white/10">
        <img 
          src="https://www.lowdistrict.it/wp-content/uploads/DSC01359-1-scaled-e1751832356345.jpg" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale"
          alt="Background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center"
        >
          <Logo className="h-16 md:h-24 mb-6 mx-auto" />
          <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic mb-2">The Stance Culture</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Official Application</p>
        </motion.div>
      </div>

      {/* Area Login integrata dal sito */}
      <div className="flex-1 bg-black relative">
        <div className="absolute inset-0 pt-8">
          <div className="text-center mb-8 px-6">
            <h2 className="text-sm font-black uppercase tracking-widest mb-4">Accedi al tuo Account</h2>
            <p className="text-[10px] text-zinc-500 uppercase font-bold max-w-xs mx-auto leading-relaxed">
              Usa le tue credenziali di LowDistrict.it per sbloccare tutte le funzionalità dell'app.
            </p>
          </div>
          
          <div className="h-[500px] relative">
            <WordPressPortal 
              url="https://www.lowdistrict.it/account/" 
              topOffset={160} 
              bottomOffset={100} 
            />
          </div>

          <div className="p-8 text-center">
            <Link to="/">
              <Button className="w-full bg-white text-black font-black uppercase italic py-8 rounded-none">
                Entra nell'App
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;