"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2070" 
          alt="Stance Car" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black"></div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-red-600 font-bold tracking-[0.3em] uppercase mb-4 text-sm md:text-base">
            The Stance Culture
          </h2>
          <h1 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none">
            LOW DISTRICT <br />
            <span className="text-transparent border-text">EST. 2018</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light">
            Non è solo un'auto, è uno stile di vita. Scopri la nostra collezione esclusiva e i prossimi eventi della community.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/shop">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 rounded-none px-10 py-7 text-lg font-bold uppercase tracking-widest w-full sm:w-auto">
                Shop Now
              </Button>
            </Link>
            <Link to="/events">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black rounded-none px-10 py-7 text-lg font-bold uppercase tracking-widest w-full sm:w-auto">
                Events
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white animate-bounce"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <ChevronDown size={32} />
      </motion.div>

      <style>{`
        .border-text {
          -webkit-text-stroke: 1px white;
        }
      `}</style>
    </section>
  );
};

export default Hero;