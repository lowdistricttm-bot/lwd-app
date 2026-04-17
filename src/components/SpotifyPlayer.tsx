"use client";

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { Music, ChevronLeft, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

const SpotifyPlayer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const playlistId = "49mK52uCtaHSCLY1VC9GR3";
  
  const x = useMotionValue(-280); // Inizia quasi tutto fuori schermo (larghezza player 300 - 20 di maniglia)
  const controls = useAnimation();

  // Gestione apertura/chiusura con snap
  const handleDragEnd = (_: any, info: any) => {
    const threshold = -150;
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
        dragElastic={0.1}
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

        {/* Maniglia Trascinabile (Linguetta) */}
        <div 
          onClick={() => isOpen ? closePlayer() : openPlayer()}
          className={cn(
            "w-10 h-20 bg-zinc-900 border-y border-r border-white/10 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing rounded-r-2xl shadow-xl transition-colors",
            isOpen ? "bg-white text-black" : "text-white hover:bg-zinc-800"
          )}
        >
          <GripVertical size={14} className="opacity-30 mb-1" />
          <Music size={18} className={cn(isOpen && "animate-pulse")} />
          {isOpen && <ChevronLeft size={14} className="mt-1" />}
        </div>
      </motion.div>
    </div>
  );
};

export default SpotifyPlayer;