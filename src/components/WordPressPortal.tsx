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

  // Proviamo a caricare l'URL pulito senza parametri se topOffset è 0 (come nel profilo)
  const appUrl = topOffset === 0 ? url : `${url}${url.includes('?') ? '&' : '?'}display=app&app_view=true`;

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 8000);
    return () => clearTimeout(timer);
  }, [key, url]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black">
          <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 italic">Caricamento...</p>
        </div>
      )}
      
      <div className="absolute top-2 right-4 z-20">
        <button 
          onClick={() => setKey(prev => prev + 1)}
          className="p-2 bg-white/5 backdrop-blur-md rounded-full text-white/30 hover:text-white border border-white/5"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <iframe 
        key={key}
        src={appUrl} 
        className="w-full h-full border-none"
        style={{ 
          marginTop: `-${topOffset}px`,
          height: `calc(100% + ${topOffset + bottomOffset}px)`,
          backgroundColor: 'black'
        }}
        onLoad={() => setIsLoading(false)}
        allow="camera; microphone; geolocation"
      />
    </div>
  );
};

export default WordPressPortal;