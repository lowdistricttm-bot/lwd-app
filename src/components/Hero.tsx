"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/use-translation';
import Logo from './Logo';

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[80vh] md:h-[90vh] w-full flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2070" 
          alt="Stance Car" 
          className="w-full h-full object-cover opacity-40 grayscale hover:grayscale-0 transition-all duration-1000 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-red-600 font-black tracking-[0.6em] uppercase mb-8 text-[10px] md:text-xs italic">
            {t.hero.subtitle}
          </h2>
          
          <div className="flex justify-center mb-10">
            <Logo className="h-24 md:h-40 drop-shadow-[0_0_30px_rgba(239,68,68,0.2)]" />
          </div>

          <p className="text-gray-300 text-base md:text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed opacity-80">
            {t.hero.desc}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8">
            <Link to="/shop" className="w-full sm:w-auto">
              <Button size="lg" className="bg-red-600 text-white hover:bg-white hover:text-black rounded-none px-10 md:px-16 py-7 md:py-8 text-sm md:text-lg font-black uppercase tracking-widest w-full italic transition-all duration-500 shadow-xl shadow-red-600/20">
                {t.hero.shopBtn}
              </Button>
            </Link>
            <Link to="/events" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white hover:text-black rounded-none px-10 md:px-16 py-7 md:py-8 text-sm md:text-lg font-black uppercase tracking-widest w-full italic transition-all duration-500 backdrop-blur-sm">
                {t.hero.eventsBtn}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 hidden md:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown size={32} />
      </motion.div>
    </section>
  );
};

export default Hero;