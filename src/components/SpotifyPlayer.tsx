"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const SpotifyPlayer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const playlistId = "49mK52uCtaHSCLY1VC9GR3";

  return (
    <div className="fixed bottom-24 md:bottom-8 left-4 md:left-8 z-[60] pointer-events-none">
      {/* Container del Player */}
      <motion.div
        initial={false}
        animate={{
          width: isExpanded ? '280px' : '48px',
          height: isExpanded ? '352px' : '48px',
          borderRadius: isExpanded ? '12px' : '50%',
          opacity: 1
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "pointer-events-auto bg-zinc-950 border border-white/10 shadow-2xl overflow-hidden flex flex-col",
          !isExpanded && "hover:border-white/40 transition-colors cursor-pointer"
        )}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        {/* Header (visibile solo se espanso) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-0 left-0 right-0 flex items-center justify-between p-2 z-10 bg-gradient-to-b from-black/80 to-transparent shrink-0"
            >
              <div className="flex items-center gap-2 pl-1">
                <Music size={12} className="text-white/60" />
                <span className="text-[8px] font-black uppercase tracking-widest italic text-white/60">District Radio</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                className="p-1 hover:bg-white/10 text-white/60 hover:text-white transition-colors rounded-full"
              >
                <ChevronDown size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Icona Musica (visibile solo se contratto) */}
        {!isExpanded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Music size={20} className="text-white" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        )}
        
        {/* Iframe Spotify */}
        <div className={cn(
          "flex-1 bg-black transition-opacity duration-500",
          isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <iframe 
            src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`} 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default SpotifyPlayer;