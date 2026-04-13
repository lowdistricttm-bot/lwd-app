"use client";

import React, { useState, useEffect } from 'react';
import { ExternalLink, AlertCircle, RefreshCw, ShieldAlert } from 'lucide-center';

interface WordPressPortalProps {
  url: string;
}

const WordPressPortal = ({ url }: WordPressPortalProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);

    // Timeout aumentato a 15 secondi per gestire server lenti
    const timer = setTimeout(() => {
      if (isLoading) setHasError(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, [url, retryCount]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setIsLoading(true);
    setHasError(false);
  };

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20">
          <RefreshCw className="text-red-600 animate-spin mb-4" size={32} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Connessione a Low District...</p>
        </div>
      )}

      <iframe 
        key={`${url}-${retryCount}`}
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 p-8 text-center z-30">
          <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="text-red-600" size={40} />
          </div>
          
          <h3 className="text-2xl font-black uppercase italic mb-3 tracking-tighter">Accesso Bloccato</h3>
          
          <div className="space-y-4 mb-8 max-w-xs mx-auto">
            <p className="text-[11px] text-gray-400 uppercase font-bold leading-relaxed">
              Il server di <span className="text-white">LowDistrict.it</span> rifiuta la connessione sicura dall'app.
            </p>
            <div className="p-4 bg-white/5 border border-white/10 text-left">
              <p className="text-[9px] font-black text-red-600 uppercase mb-1">Soluzione Rapida:</p>
              <p className="text-[10px] text-gray-300 leading-tight">
                Disabilita "Clickjacking Protection" in SiteGround Optimizer o Wordfence.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button 
              onClick={handleRetry}
              className="bg-white text-black px-6 py-5 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all italic"
            >
              <RefreshCw size={16} /> Riprova Connessione
            </button>
            
            <button 
              onClick={() => window.open(url, '_blank')}
              className="bg-zinc-900 text-white px-6 py-5 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-white/5 hover:bg-zinc-800 transition-all italic"
            >
              <ExternalLink size={16} /> Apri nel Browser
            </button>
          </div>
          
          <p className="mt-8 text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
            ID Errore: X-FRAME-OPTIONS-DENY
          </p>
        </div>
      )}
    </div>
  );
};

export default WordPressPortal;