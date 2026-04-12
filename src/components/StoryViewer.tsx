"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Heart } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

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

const STORY_DURATION = 5000;
const REACTIONS = ['🔥', '😂', '❤️', '😍', '😮', '😢'];

const StoryViewer = ({ stories, initialIndex, onClose }: StoryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [comment, setComment] = useState("");
  const [showReactions, setShowReactions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
      setComment("");
      setShowReactions(false);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
      setComment("");
      setShowReactions(false);
    } else {
      setProgress(0);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused) return;

    const interval = 50;
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

  const handleScreenClick = (e: React.MouseEvent | React.TouchEvent) => {
    // Se stiamo interagendo con l'input o le reazioni, non cambiare storia
    if ((e.target as HTMLElement).closest('.story-controls')) return;

    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const width = window.innerWidth;
    
    if (x < width * 0.3) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    showSuccess(`Messaggio inviato a ${stories[currentIndex].name}`);
    setComment("");
    setIsPaused(false);
    inputRef.current?.blur();
  };

  const handleReaction = (emoji: string) => {
    showSuccess(`Reazione ${emoji} inviata a ${stories[currentIndex].name}`);
    setShowReactions(false);
    setIsPaused(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
    >
      <div className="relative w-full h-full md:max-w-[450px] md:h-[90vh] bg-zinc-900 md:rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        
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

        {/* Main Content Area */}
        <div 
          className="relative flex-1 w-full overflow-hidden"
          onMouseDown={() => !comment && setIsPaused(true)}
          onMouseUp={() => !comment && setIsPaused(false)}
          onTouchStart={() => !comment && setIsPaused(true)}
          onTouchEnd={(e) => { if(!comment) { setIsPaused(false); handleScreenClick(e); } }}
          onClick={handleScreenClick}
        >
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              src={stories[currentIndex].img} 
              alt="" 
              className="w-full h-full object-cover pointer-events-none"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

          {/* Quick Reactions Overlay */}
          <AnimatePresence>
            {showReactions && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute inset-0 flex items-center justify-center z-40 story-controls"
              >
                <div className="grid grid-cols-3 gap-6 p-8 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10">
                  {REACTIONS.map((emoji) => (
                    <button 
                      key={emoji} 
                      onClick={() => handleReaction(emoji)}
                      className="text-4xl hover:scale-125 transition-transform active:scale-90"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Controls (Instagram Style) */}
        <div className="p-4 pb-8 md:pb-4 bg-black/20 backdrop-blur-sm story-controls z-50">
          <form onSubmit={handleSendMessage} className="flex items-center gap-4">
            <div className="flex-1 relative">
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Invia un messaggio..." 
                className="w-full bg-transparent border border-white/30 rounded-full py-2.5 px-5 text-sm text-white placeholder:text-white/60 focus:outline-none focus:border-white transition-colors"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onFocus={() => { setIsPaused(true); setShowReactions(true); }}
                onBlur={() => { if(!comment) { setIsPaused(false); setShowReactions(false); } }}
              />
            </div>
            {comment ? (
              <button type="submit" className="text-white p-2">
                <Send size={20} />
              </button>
            ) : (
              <button 
                type="button" 
                onClick={() => showSuccess('Aggiunto ai preferiti!')}
                className="text-white p-2 hover:text-red-600 transition-colors"
              >
                <Heart size={24} />
              </button>
            )}
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default StoryViewer;