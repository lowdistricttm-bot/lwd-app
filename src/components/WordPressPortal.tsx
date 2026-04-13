"use client";

import React, { useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

interface WordPressPortalProps {
  url: string;
  headerHeight?: number; // Altezza stimata dell'header da nascondere (es. 80)
}

const WordPressPortal = ({ url, headerHeight = 0 }: WordPressPortalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0);

  // Parametri per il sito WP
  const appUrl = `${url}${url.includes('?') ? '&' : '?'}display=app&app_view=true`;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black">
          <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Sincronizzazione...</p>
        </div>
      )}
      
      <div className="absolute top-2 right-4 z-20 flex gap-2">
        <button 
          onClick={() => { setIsLoading(true); setKey(prev => prev + 1); }}
          className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-colors"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div 
        className="w-full h-full overflow-hidden"
        style={{ 
          marginTop: `-${headerHeight}px`, 
          height: `calc(100% + ${headerHeight}px)` 
        }}
      >
        <iframe 
          key={key}
          src={appUrl} 
          className="w-full h-full border-none"
          style={{ backgroundColor: 'black' }}
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
};

export default WordPressPortal;