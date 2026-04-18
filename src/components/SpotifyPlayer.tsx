"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Music, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

const SpotifyPlayer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playlistId = "49mK52uCtaHSCLY1VC9GR3";
  const controllerRef = useRef<any>(null);
  
  const CLOSED_X = -280; // Regolato per nascondere esattamente il widget

  useEffect(() => {
    // Carichiamo lo script delle Spotify IFrame API
    const script = document.createElement('script');
    script.src = "https://open.spotify.com/embed-podcast/iframe-api/v1";
    script.async = true;
    document.body.appendChild(script);

    // Casting a any per evitare l'errore TS2339 su window
    (window as any).onSpotifyIframeApiReady = (IFrameAPI: any) => {
      const element = document.getElementById('spotify-embed');
      const options = {
        uri: `spotify:playlist:${playlistId}`,
        width: '100%',
        height: '152',
        theme: '0'
      };
      
      IFrameAPI.createController(element, options, (EmbedController: any) => {
        controllerRef.current = EmbedController;
        
        // Ascoltiamo gli aggiornamenti della riproduzione
        EmbedController.on('playback_update', (e: any) => {
          const { isPaused, duration } = e.data;
          // Se non è in pausa e la durata è maggiore di 0, sta suonando
          setIsPlaying(!isPaused && duration > 0);
        });
      });
    };

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, [playlistId]);

  return (
    <div className="fixed bottom-28 left-0 z-[100] pointer-events-none">
      <motion.div
        animate={{ x: isOpen ? 0 : CLOSED_X }}
        initial={{ x: CLOSED_X }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="pointer-events-auto flex items-center"
      >
        {/* Corpo del Player - Completamente trasparente */}
        <div className="w-[280px] h-[152px] bg-transparent overflow-hidden">
          <div id="spotify-embed"></div>
        </div>

        {/* Linguetta cliccabile */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-6 h-10 flex items-center justify-center cursor-pointer rounded-r-md border-y border-r border-white/10 shadow-xl transition-all duration-500",
            isOpen || isPlaying ? "bg-white text-black" : "bg-zinc-900/80 backdrop-blur-md text-white hover:bg-zinc-800"
          )}
        >
          {isPlaying ? (
            <Play size={10} fill="currentColor" className="shrink-0 animate-pulse" />
          ) : (
            <Music size={12} className="shrink-0" />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SpotifyPlayer;