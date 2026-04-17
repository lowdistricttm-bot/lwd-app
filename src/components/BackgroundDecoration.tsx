"use client";

import React from 'react';

const BackgroundDecoration = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
      {/* Blob 1 - Top Left (Accento Slate/Zinc) */}
      <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-zinc-800/40 blur-[120px] rounded-full animate-blob" />
      
      {/* Blob 2 - Bottom Right (Profondità Zinc) */}
      <div className="absolute bottom-[-15%] right-[-5%] w-[80%] h-[80%] bg-zinc-900/80 blur-[140px] rounded-full animate-blob" style={{ animationDelay: '2s' }} />
      
      {/* Blob 3 - Center (Luce soffusa bianca per contrasto) */}
      <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-white/[0.03] blur-[100px] rounded-full animate-blob" style={{ animationDelay: '5s' }} />
      
      {/* Blob 4 - Bottom Left (Tonalità fredda molto scura) */}
      <div className="absolute bottom-[5%] left-[-10%] w-[50%] h-[50%] bg-zinc-700/10 blur-[110px] rounded-full animate-blob" style={{ animationDelay: '7s' }} />

      {/* Texture di grana per eliminare il banding dello sfocato */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      
      {/* Overlay gradiente per vignettatura */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
    </div>
  );
};

export default BackgroundDecoration;