"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, ExternalLink } from 'lucide-react';

interface WordPressPortalProps {
  url: string;
  title?: string;
}

const WordPressPortal = ({ url }: WordPressPortalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0);

  // Aggiungiamo un parametro per dire al sito che siamo nell'app
  const appUrl = `${url}${url.includes('?') ? '&' : '?'}display=app&app_view=true`;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black">
          <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Caricamento bacheca...</p>
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

      <iframe 
        key={key}
        src={appUrl} 
        className="w-full h-full border-none"
        style={{ 
          backgroundColor: 'black',
          // Tentativo di "ritagliare" l'header se non puoi modificarlo lato WP
          // marginTop: '-60px', 
          // height: 'calc(100% + 60px)' 
        }}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};

export default WordPressPortal;