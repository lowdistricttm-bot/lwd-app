"use client";

import React from 'react';

const BackgroundDecoration = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
      {/* Gradiente Verticale Globale */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900/20 to-black" />

      {/* Blobs Decorativi - Ridotto il raggio di blur per stabilità mobile */}
      <div className="absolute top-[-5%] left-[-5%] w-[60%] h-[60%] bg-zinc-800/10 blur-[60px] rounded-full animate-blob" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[70%] h-[70%] bg-zinc-900/40 blur-[80px] rounded-full animate-blob" style={{ animationDelay: '2s' }} />
      
      {/* Texture di grana */}
      <div className="absolute inset-0 opacity-[0.01] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
    </div>
  );
};

export default BackgroundDecoration;