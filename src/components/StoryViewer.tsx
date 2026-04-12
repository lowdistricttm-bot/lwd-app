"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, ChevronUp, MoreHorizontal } from 'lucide-react';
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
const REACTIONS = ['🔥', '😂', '❤️', '😍', '😮', '😢', '👏', '🎉'];

const StoryViewer = ({ stories, initialIndex, onClose }: StoryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [comment, setComment] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
      setComment("");
      setShowInput(false);
      setShowReactions(false);
      setIsPaused(false);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
      setComment("");
      setShowInput(false);
      setShowReactions(false);
      setIsPaused(false);
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
          return 100;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused]);

  useEffect(() => {
    if (progress >= 100) {
      handleNext();
    }
  }, [progress, handleNext]);

  const handleScreenClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.story-controls')) return;
    
    if (showInput || showReactions) {
      setShowInput(false);
      setShowReactions(false);
      setIsPaused(false);
      return;
    }

    const x = e.clientX;
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
    showSuccess(`Messaggio inviato`);
    setComment("");
    setShowInput(false);
    setIsPaused(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center touch-none"
    >
      {/* Container principale che occupa tutto lo schermo */}
      <div className="relative w-full h-full md:max-w-[450px] md:h-[95vh] bg-black md:rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* Barre di progresso */}
        <div className="absolute top-4 left-3 right-3 z-50 flex gap-1.5">
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

        {/* Header Storia */}
        <div className="absolute top-8 left-4 right-4 z-50 flex items-center justify-between story-controls">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20">
              <img src={stories[currentIndex].img} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm leading-none">{stories[currentIndex].name}</span>
              <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-1">2 ore fa</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-white/80 hover:text-white transition-colors">
              <MoreHorizontal size={20} />
            </button>
            <button onClick={onClose} className="text-white p-1 hover:scale-110 transition-transform">
              <X size={28} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Area Immagine */}
        <div 
          className="relative flex-1 w-full overflow-hidden bg-zinc-950"
          onClick={handleScreenClick}
        >
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              src={stories[currentIndex].img} 
              alt="" 
              className="w-full h-full object-cover pointer-events-none"
            />
          </AnimatePresence>
          
          {/* Gradienti per leggibilità */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />

          {/* Swipe up hint */}
          {!showReactions && !showInput && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-28 left-0 right-0 flex flex-col items-center text-white/60 pointer-events-none"
            >
              <ChevronUp size={20} className="animate-bounce mb-1" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Reazioni</span>
            </motion.div>
          )}

          {/* Overlay Reazioni */}
          <AnimatePresence>
            {showReactions && (
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="absolute inset-0 flex items-end z-[60] story-controls"
              >
                <div className="w-full p-8 bg-black/90 backdrop-blur-xl rounded-t-[2.5rem] border-t border-white/10">
                  <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-10" />
                  <div className="grid grid-cols-4 gap-y-10 gap-x-4 mb-12">
                    {REACTIONS.map((emoji) => (
                      <button 
                        key={emoji} 
                        onClick={() => { showSuccess(`Reazione ${emoji} inviata`); setShowReactions(false); setIsPaused(false); }}
                        className="text-4xl hover:scale-125 transition-transform active:scale-90"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Controlli */}
        <div className="p-5 pb-12 md:pb-8 bg-black story-controls z-[70]">
          <AnimatePresence mode="wait">
            {showInput ? (
              <motion.form 
                key="input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onSubmit={handleSendMessage} 
                className="flex items-center gap-4"
              >
                <input 
                  autoFocus
                  type="text" 
                  placeholder={`Rispondi a ${stories[currentIndex].name}...`} 
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-full py-3.5 px-6 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-600"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button type="submit" className="text-red-600 font-black uppercase tracking-widest text-xs">Invia</button>
              </motion.form>
            ) : (
              <div className="flex items-center gap-5">
                <button 
                  onClick={() => { setShowInput(true); setIsPaused(true); }}
                  className="flex-1 flex items-center gap-3 bg-transparent border border-white/30 rounded-full py-3 px-6 text-white/60 text-left"
                >
                  <span className="text-sm font-medium">Invia un messaggio...</span>
                </button>
                <button onClick={() => { setShowReactions(true); setIsPaused(true); }} className="text-white/80 hover:text-white transition-colors">
                  <MessageCircle size={26} strokeWidth={1.5} />
                </button>
                <button onClick={() => showSuccess('Inviato!')} className="text-white/80 hover:text-white transition-colors">
                  <Send size={26} strokeWidth={1.5} />
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default StoryViewer;