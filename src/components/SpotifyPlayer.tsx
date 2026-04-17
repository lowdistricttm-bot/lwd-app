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
          width: isExpanded ? (window.innerWidth < 768 ? '280px' : '320px') : '48px',
          height: isExpanded ? (window.innerHeight < 600 ? '350px' : '400px') : '48px',
          borderRadius: isExpanded ? '16px' : '50%',
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
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between p-3 border-b border-white/5 bg-zinc-900/50 shrink-0"
            >
              <div className="flex items-center gap-2">
                <Music size={14} className="text-zinc-400" />
                <span className="text-[9px] font-black uppercase tracking-widest italic">District Radio</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                className="p-1.5 hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
              >
                <ChevronDown size={16} />
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
        
        {/* Iframe Spotify - Sempre presente per continuità audio */}
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
            className="rounded-b-2xl"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default SpotifyPlayer;