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

  // URL con parametro per forzare il refresh ed evitare cache
  const appUrl = `${url}${url.includes('?') ? '&' : '?'}v=${key}`;

  useEffect(() => {
    setIsLoading(true);
    // Timeout di sicurezza: se dopo 8 secondi non ha caricato, togliamo il loader comunque
    const timer = setTimeout(() => setIsLoading(false), 8000);
    return () => clearTimeout(timer);
  }, [key, url]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
          <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 italic">Sincronizzazione...</p>
        </div>
      )}
      
      <div className="absolute top-2 right-4 z-40">
        <button 
          onClick={() => setKey(prev => prev + 1)}
          className="p-2 bg-white/5 backdrop-blur-md rounded-full text-white/30 hover:text-white border border-white/5 transition-all"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="w-full h-full overflow-hidden">
        <iframe 
          key={key}
          src={appUrl} 
          className="w-full h-full border-none"
          style={{ 
            backgroundColor: 'black',
            display: 'block'
          }}
          onLoad={() => setIsLoading(false)}
          allow="camera; microphone; geolocation; clipboard-write"
        />
      </div>
    </div>
  );
};

export default WordPressPortal;