"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import WordPressPortal from '@/components/WordPressPortal';
import Logo from '@/components/Logo';

const Community = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      {/* Header di Presentazione della Community */}
      <div className="relative h-[35vh] flex flex-col items-center justify-center px-6 overflow-hidden border-b border-white/10 mt-[calc(4.2rem+env(safe-area-inset-top))]">
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
          <Logo className="h-12 md:h-16 mb-4 mx-auto" />
          <h1 className="text-xl md:text-3xl font-black tracking-tighter uppercase italic mb-1">Bacheca Community</h1>
          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500">Low District Social Feed</p>
        </motion.div>
      </div>

      {/* Portale Bacheca */}
      <div className="flex-1 relative mb-[calc(4rem+env(safe-area-inset-bottom))]">
        <WordPressPortal 
          url="https://www.lowdistrict.it/bacheca" 
          topOffset={160} 
          bottomOffset={150} 
        />
      </div>

      <BottomNav />
    </div>
  );
};

export default Community;