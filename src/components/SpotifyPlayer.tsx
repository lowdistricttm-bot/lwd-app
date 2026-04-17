"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, ChevronDown, ChevronUp, X, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

const SpotifyPlayer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const playlistId = "49mK52uCtaHSCLY1VC9GR3";

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-6 z-[60] pointer-events-none">
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="pointer-events-auto w-[300px] md:w-[350px] bg-zinc-950 border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-3 border-b border-white/5 bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Music size={14} className="text-zinc-400" />
                <span className="text-[9px] font-black uppercase tracking-widest italic">District Radio</span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
            
            <div className="aspect-[1/1.2] w-full bg-black">
              <iframe 
                src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`} 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
                className="opacity-90"
              />
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setIsExpanded(true)}
            className="pointer-events-auto group relative flex items-center gap-3 bg-white text-black px-4 py-3 shadow-xl hover:bg-zinc-200 transition-all"
          >
            <div className="relative">
              <Music size={18} className="group-hover:animate-bounce" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-zinc-900 rounded-full animate-ping" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest italic pr-2">Playlist Ufficiale</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpotifyPlayer;