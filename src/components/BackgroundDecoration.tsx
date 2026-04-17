"use client";

import React from 'react';

const BackgroundDecoration = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
      {/* Blob 1 - Top Left (Più intenso) */}
      <div className="absolute top-[-15%] left-[-10%] w-[70%] h-[70%] bg-zinc-800/40 blur-[100px] rounded-full animate-blob" />
      
      {/* Blob 2 - Bottom Right (Più intenso) */}
      <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-zinc-900/60 blur-[120px] rounded-full animate-blob" style={{ animationDelay: '2s' }} />
      
      {/* Blob 3 - Center Left (Nuovo punto di luce) */}
      <div className="absolute top-[20%] left-[-20%] w-[50%] h-[50%] bg-white/[0.04] blur-[80px] rounded-full animate-blob" style={{ animationDelay: '5s' }} />
      
      {/* Blob 4 - Bottom Left (Accento scuro) */}
      <div className="absolute bottom-[10%] left-[10%] w-[40%] h-[40%] bg-zinc-700/20 blur-[100px] rounded-full animate-blob" style={{ animationDelay: '7s' }} />

      {/* Overlay di grana/noise per dare texture allo sfocato */}
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      
      {/* Vignettatura per concentrare l'attenzione al centro */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
    </div>
  );
};

export default BackgroundDecoration;