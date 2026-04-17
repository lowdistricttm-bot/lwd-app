"use client";

import React from 'react';

const BackgroundDecoration = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
      {/* Gradiente Verticale Globale: Nero -> Grigio -> Nero */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900/40 to-black" />

      {/* Blobs Decorativi Esistenti */}
      <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-zinc-800/20 blur-[120px] rounded-full animate-blob" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[80%] h-[80%] bg-zinc-900/60 blur-[140px] rounded-full animate-blob" style={{ animationDelay: '2s' }} />
      
      {/* Texture di grana per profondità */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      
      {/* Overlay finale per morbidezza */}
      <div className="absolute inset-0 bg-black/10" />
    </div>
  );
};

export default BackgroundDecoration;