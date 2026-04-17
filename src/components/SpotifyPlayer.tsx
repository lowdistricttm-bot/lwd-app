"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, ChevronDown, X } from 'lucide-react';
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
          width: isExpanded ? '300px' : '48px',
          height: isExpanded ? '152px' : '48px',
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
        {/* Pulsante di chiusura rapida (visibile solo se espanso) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
              className="absolute top-2 right-2 z-10 p-1 bg-black/60 hover:bg-black rounded-full text-white/70 hover:text-white transition-all"
            >
              <X size={14} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Icona Musica (visibile solo se contratto) */}
        {!isExpanded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Music size={20} className="text-white" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        )}
        
        {/* Iframe Spotify - Versione Compact (152px) */}
        <div className={cn(
          "flex-1 bg-black transition-opacity duration-500 overflow-hidden",
          isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <iframe 
            src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`} 
            width="100%" 
            height="152" 
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