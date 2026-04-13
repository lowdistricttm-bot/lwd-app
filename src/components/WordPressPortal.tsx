"use client";

import React from 'react';

interface WordPressPortalProps {
  url: string;
}

const WordPressPortal = ({ url }: WordPressPortalProps) => {
  return (
    <div className="w-full h-full bg-black overflow-hidden">
      <iframe 
        src={url} 
        className="w-full h-full border-none"
        allow="camera; microphone; geolocation; clipboard-write; payment"
        style={{ 
          display: 'block',
          width: '100%',
          height: '100%',
          background: 'black'
        }}
      />
    </div>
  );
};

export default WordPressPortal;