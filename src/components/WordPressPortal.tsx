"use client";

import React, { useState, useEffect } from 'react';
import { ExternalLink, AlertCircle } from 'lucide-react';

interface WordPressPortalProps {
  url: string;
}

const WordPressPortal = ({ url }: WordPressPortalProps) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Se dopo 5 secondi non vediamo nulla, mostriamo il link di emergenza
    const timer = setTimeout(() => {
      setHasError(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [url]);

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <iframe 
        src={url} 
        className="w-full h-full border-none"
        allow="camera; microphone; geolocation; clipboard-write; payment"
        onLoad={() => setHasError(false)}
        style={{ 
          display: 'block',
          width: '100%',
          height: '100%',
          background: 'black'
        }}
      />
      
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 text-center z-10">
          <AlertCircle className="text-red-600 mb-4" size={40} />
          <h3 className="text-lg font-black uppercase italic mb-2">Accesso Bloccato</h3>
          <p className="text-xs text-gray-500 uppercase font-bold mb-6 max-w-xs">
            WordPress sta bloccando la visualizzazione sicura. Devi abilitare gli iframe sul tuo sito o aprirlo esternamente.
          </p>
          <button 
            onClick={() => window.open(url, '_blank')}
            className="bg-white text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
          >
            <ExternalLink size={14} /> Apri nel Browser
          </button>
        </div>
      )}
    </div>
  );
};

export default WordPressPortal;