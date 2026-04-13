"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw } from 'lucide-center';

interface WordPressPortalProps {
  url: string;
  topOffset?: number; 
  bottomOffset?: number;
}

const WordPressPortal = ({ url, topOffset = 0, bottomOffset = 0 }: WordPressPortalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0);

  // Forziamo i parametri app su TUTTE le pagine per coerenza
  const appUrl = `${url}${url.includes('?') ? '&' : '?'}display=app&app_view=true&v=${key}`;

  useEffect(() => {
    setIsLoading(true);
    // Timeout di sicurezza più breve per mostrare l'iframe il prima possibile
    const timer = setTimeout(() => setIsLoading(false), 5000);
    return () => clearTimeout(timer);
  }, [key, url]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black">
          <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 italic">Sincronizzazione...</p>
        </div>
      )}
      
      <div className="absolute top-2 right-4 z-20">
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
          className="w-full border-none"
          style={{ 
            marginTop: `-${topOffset}px`,
            height: `calc(100% + ${topOffset + bottomOffset}px)`,
            backgroundColor: 'black',
            display: 'block'
          }}
          onLoad={() => setIsLoading(false)}
          allow="camera; microphone; geolocation; clipboard-write"
          loading="eager"
        />
      </div>
    </div>
  );
};

export default WordPressPortal;