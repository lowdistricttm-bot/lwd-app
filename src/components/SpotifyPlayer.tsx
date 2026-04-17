"use client";

import React, { useState } from 'react';
import { motion, useMotionValue, useAnimation } from 'framer-motion';
import { Music } from 'lucide-react';
import { cn } from '@/lib/utils';

const SpotifyPlayer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const playlistId = "49mK52uCtaHSCLY1VC9GR3";
  
  const x = useMotionValue(-280); 
  const controls = useAnimation();

  const handleDragEnd = (_: any, info: any) => {
    if (info.point.x > 100 || info.offset.x > 50) {
      openPlayer();
    } else {
      closePlayer();
    }
  };

  const openPlayer = () => {
    setIsOpen(true);
    controls.start({ x: 0 });
  };

  const closePlayer = () => {
    setIsOpen(false);
    controls.start({ x: -280 });
  };

  return (
    <div className="fixed bottom-32 left-0 z-[100] pointer-events-none">
      <motion.div
        drag="x"
        dragConstraints={{ left: -280, right: 0 }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ x: -280 }}
        style={{ x }}
        className="pointer-events-auto flex items-center"
      >
        {/* Corpo del Player */}
        <div className="w-[280px] h-[152px] bg-black border-y border-r border-white/10 shadow-2xl overflow-hidden">
          <iframe 
            src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`} 
            width="100%" 
            height="152" 
            frameBorder="0" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy"
          />
        </div>

        {/* Linguetta Ultra-Minimal */}
        <div 
          onClick={() => isOpen ? closePlayer() : openPlayer()}
          className={cn(
            "w-8 h-12 flex items-center justify-center cursor-pointer rounded-r-xl border-y border-r border-white/10 shadow-xl transition-all duration-500",
            isOpen ? "bg-white text-black" : "bg-zinc-900/80 backdrop-blur-md text-white hover:bg-zinc-800"
          )}
        >
          <Music size={16} className={cn(isOpen && "animate-pulse")} />
        </div>
      </motion.div>
    </div>
  );
};

export default SpotifyPlayer;