"use client";

import React from 'react';

const BackgroundDecoration = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
      {/* Gradiente Verticale Globale: Più leggero per performance mobile */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900/20 to-black" />
      
      {/* Texture di grana minima - Rimosso mix-blend-overlay che causava crash GPU */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      
      {/* Overlay di sicurezza */}
      <div className="absolute inset-0 bg-black/5" />
    </div>
  );
};

export default BackgroundDecoration;