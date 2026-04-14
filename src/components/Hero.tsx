"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ChevronRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Hero = () => {
  return (
    <section className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Background con overlay dinamico */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://www.lowdistrict.it/wp-content/uploads/DSC01359-1-scaled-e1751832356345.jpg" 
          alt="Low District Stance" 
          className="w-full h-full object-cover opacity-50 grayscale scale-110 animate-pulse-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-red-600 font-black tracking-[0.6em] uppercase mb-6 text-[10px] md:text-xs italic">
            The Stance Culture Official App
          </h2>
          
          <div className="flex justify-center mb-10">
            <Logo className="h-20 md:h-32" variant="white" />
          </div>

          <p className="text-gray-300 text-sm md:text-xl mb-12 max-w-2xl mx-auto font-bold uppercase tracking-tight leading-tight opacity-90 italic">
            Definiamo lo standard. <br className="hidden md:block" />
            Esplora il merchandising ufficiale e unisciti alla community.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/shop" className="w-full sm:w-auto">
              <Button className="bg-white text-black hover:bg-red-600 hover:text-white rounded-none px-12 py-8 text-sm font-black uppercase tracking-widest w-full italic transition-all duration-500 group">
                Shop Online <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </Button>
            </Link>
            <Link to="/events" className="w-full sm:w-auto">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-none px-12 py-8 text-sm font-black uppercase tracking-widest w-full italic backdrop-blur-sm">
                <Play className="mr-2 fill-current" size={16} /> Eventi 2025
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-red-600 to-transparent"></div>
      </motion.div>
    </section>
  );
};

export default Hero;