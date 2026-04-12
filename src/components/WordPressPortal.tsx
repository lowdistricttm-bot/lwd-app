"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, ExternalLink, RefreshCw } from 'lucide-react';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

interface WordPressPortalProps {
  title: string;
  url: string;
}

const WordPressPortal = ({ title, url }: WordPressPortalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [key, setKey] = useState(0);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-[60] bg-black/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-black uppercase italic tracking-tighter">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setKey(prev => prev + 1)} className="p-2 text-gray-500 hover:text-white">
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
          <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-red-600">
            <ExternalLink size={18} />
          </a>
        </div>
      </div>

      <div className="flex-1 pt-20 pb-20 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black">
            <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sincronizzazione con il server...</p>
          </div>
        )}
        <iframe 
          key={key}
          src={url} 
          className="w-full h-full border-none"
          onLoad={() => setIsLoading(false)}
          title={title}
        />
      </div>
      <BottomNav />
    </div>
  );
};

export default WordPressPortal;