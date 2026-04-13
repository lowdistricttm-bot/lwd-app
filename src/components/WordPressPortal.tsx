"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

interface WordPressPortalProps {
  url: string;
  topOffset?: number; 
  bottomOffset?: number;
}

const WordPressPortal = ({ url, topOffset = 0, bottomOffset = 0 }: WordPressPortalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0);

  // Parametri per il sito WP per ottimizzare la vista app
  const appUrl = `${url}${url.includes('?') ? '&' : '?'}display=app&app_view=true`;

  useEffect(() => {
    // Reset loading quando cambia l'URL o la chiave
    setIsLoading(true);
    
    // Timeout di sicurezza: se dopo 10 secondi non ha caricato, togliamo il loader
    const timer = setTimeout(() => setIsLoading(false), 10000);
    return () => clearTimeout(timer);
  }, [key, url]);

  return (
    <div className="relative w-full h-full bg-zinc-950 overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 italic">Sincronizzazione...</p>
        </div>
      )}
      
      <div className="absolute top-2 right-4 z-20 flex gap-2">
        <button 
          onClick={() => { setKey(prev => prev + 1); }}
          className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-colors border border-white/5"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="w-full h-full overflow-hidden relative">
        <iframe 
          key={key}
          src={appUrl} 
          className="absolute w-full border-none"
          style={{ 
            backgroundColor: 'transparent',
            top: `-${topOffset}px`,
            height: `calc(100% + ${topOffset + bottomOffset}px)`,
            left: 0
          }}
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
};

export default WordPressPortal;