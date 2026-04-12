"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/use-translation';

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2070" 
          alt="Stance Car" 
          className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black"></div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-red-600 font-black tracking-[0.5em] uppercase mb-6 text-xs md:text-sm italic">
            {t.hero.subtitle}
          </h2>
          <h1 className="text-6xl md:text-9xl font-black text-white mb-8 tracking-tighter leading-none italic">
            LOW <span className="text-transparent border-text">DISTRICT</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            {t.hero.desc}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/shop" className="w-full sm:w-auto">
              <Button size="lg" className="bg-red-600 text-white hover:bg-white hover:text-black rounded-none px-12 py-8 text-lg font-black uppercase tracking-widest w-full italic transition-all duration-300">
                {t.hero.shopBtn}
              </Button>
            </Link>
            <Link to="/events" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black rounded-none px-12 py-8 text-lg font-black uppercase tracking-widest w-full italic transition-all duration-300">
                {t.hero.eventsBtn}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown size={32} />
      </motion.div>

      <style>{`
        .border-text {
          -webkit-text-stroke: 1.5px white;
        }
      `}</style>
    </section>
  );
};

export default Hero;