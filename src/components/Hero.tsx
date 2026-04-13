"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import Logo from './Logo';

const Hero = () => {
  return (
    <section className="relative h-[70vh] w-full flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://www.lowdistrict.it/wp-content/uploads/DSC01359-1-scaled-e1751832356345.jpg" 
          alt="Low District Stance" 
          className="w-full h-full object-cover opacity-40 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-zinc-400 font-black tracking-[0.5em] uppercase mb-6 text-[10px] md:text-xs italic">
            The Stance Culture
          </h2>
          
          <div className="flex justify-center mb-8">
            <Logo className="h-16 md:h-24" variant="white" />
          </div>

          <p className="text-gray-400 text-sm md:text-lg mb-12 max-w-xl mx-auto font-bold uppercase tracking-tight leading-tight opacity-80">
            Più di una passione, uno stile di vita. <br />
            Benvenuto nel nuovo distretto.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="bg-white text-black hover:bg-zinc-200 rounded-none px-12 py-8 text-sm font-black uppercase tracking-widest w-full sm:w-auto italic transition-all duration-300">
              Esplora
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;