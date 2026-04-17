"use client";

import React from 'react';

const BackgroundDecoration = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
      {/* Blob 1 - Top Left */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-zinc-900/20 blur-[120px] rounded-full animate-blob" />
      
      {/* Blob 2 - Bottom Right */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-zinc-800/10 blur-[150px] rounded-full animate-blob" style={{ animationDelay: '2s' }} />
      
      {/* Blob 3 - Center (Subtle) */}
      <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-white/[0.02] blur-[100px] rounded-full animate-blob" style={{ animationDelay: '4s' }} />
      
      {/* Overlay di grana/noise opzionale per texture */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
    </div>
  );
};

export default BackgroundDecoration;