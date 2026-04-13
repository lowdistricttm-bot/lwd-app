"use client";

import React, { useState, useEffect } from 'react';
import { ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';

interface WordPressPortalProps {
  url: string;
}

const WordPressPortal = ({ url }: WordPressPortalProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset stato al cambio URL
    setHasError(false);
    setIsLoading(true);

    // Se dopo 10 secondi non ha caricato, mostriamo il link di emergenza
    const timer = setTimeout(() => {
      if (isLoading) setHasError(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [url]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
          <RefreshCw className="text-red-600 animate-spin" size={32} />
        </div>
      )}

      <iframe 
        src={url} 
        className="w-full h-full border-none"
        allow="camera; microphone; geolocation; clipboard-write; payment"
        onLoad={handleLoad}
        style={{ 
          display: 'block',
          width: '100%',
          height: '100%',
          background: 'black'
        }}
      />
      
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 p-6 text-center z-30">
          <AlertCircle className="text-red-600 mb-4" size={40} />
          <h3 className="text-lg font-black uppercase italic mb-2">Accesso Bloccato</h3>
          <p className="text-xs text-gray-500 uppercase font-bold mb-6 max-w-xs leading-relaxed">
            Il tuo sito WordPress sta ancora bloccando la connessione.<br/><br/>
            Se hai plugin come <span className="text-white">Wordfence</span> o <span className="text-white">SiteGround Optimizer</span>, disabilita la protezione "Clickjacking" o "X-Frame-Options".
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
            >
              Riprova Caricamento
            </button>
            <button 
              onClick={() => window.open(url, '_blank')}
              className="bg-white/10 text-white px-6 py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
            >
              <ExternalLink size={14} /> Apri nel Browser
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordPressPortal;