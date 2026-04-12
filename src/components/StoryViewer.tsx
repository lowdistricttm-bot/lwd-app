"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Story {
  id: number;
  name: string;
  img: string;
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

const STORY_DURATION = 5000; // 5 secondi per story

const StoryViewer = ({ stories, initialIndex, onClose }: StoryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    } else {
      setProgress(0); // Riavvia la story corrente se è la prima
    }
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused) return;

    const interval = 50; // Update ogni 50ms
    const increment = (interval / STORY_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, handleNext]);

  // Gestione click/touch per navigazione
  const handleScreenClick = (e: React.MouseEvent | React.TouchEvent) => {
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const width = window.innerWidth;
    
    if (x < width * 0.3) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
    >
      <div className="relative w-full h-full md:max-w-[450px] md:h-[90vh] bg-zinc-900 md:rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-30 flex gap-1.5">
          {stories.map((_, i) => (
            <div key={i} className="h-[2px] flex-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ 
                  width: i === currentIndex ? `${progress}%` : i < currentIndex ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header Info */}
        <div className="absolute top-8 left-4 right-4 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden">
              <img src={stories[currentIndex].img} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="text-white font-bold text-xs uppercase tracking-widest">
              {stories[currentIndex].name}
            </span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }} 
            className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Areas (Invisible) */}
        <div 
          className="absolute inset-0 z-20 flex"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={(e) => { setIsPaused(false); handleScreenClick(e); }}
          onClick={handleScreenClick}
        >
          <div className="w-[30%] h-full" />
          <div className="w-[70%] h-full" />
        </div>

        {/* Story Content */}
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            src={stories[currentIndex].img} 
            alt="" 
            className="w-full h-full object-cover pointer-events-none"
          />
        </AnimatePresence>

        {/* Overlay Gradiente per leggibilità */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20 pointer-events-none" />
      </div>
    </motion.div>
  );
};

export default StoryViewer;