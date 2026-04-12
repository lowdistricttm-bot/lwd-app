"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, Send, MessageCircle, ChevronUp } from 'lucide-react';
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
  const [showInput, setShowInput] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, handleNext]);

  const handleScreenClick = (e: React.MouseEvent | React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.story-controls')) return;
    if (showInput || showReactions) {
      setShowInput(false);
      setShowReactions(false);
      setIsPaused(false);
      return;
    }

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
    setShowInput(false);
    setIsPaused(false);
  };

  const handleReaction = (emoji: string) => {
    showSuccess(`Reazione ${emoji} inviata!`);
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

        {/* Main Content Area with Swipe Detection */}
        <motion.div 
          className="relative flex-1 w-full overflow-hidden touch-none"
          onPanEnd={(_, info) => {
            if (info.offset.y < -50) { // Swipe Up
              setIsPaused(true);
              setShowReactions(true);
            }
          }}
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

          {/* Swipe Up Indicator */}
          {!showReactions && !showInput && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-20 left-0 right-0 flex flex-col items-center text-white/60 pointer-events-none"
            >
              <ChevronUp size={20} className="animate-bounce" />
              <span className="text-[8px] font-black uppercase tracking-[0.3em]">Reactions</span>
            </motion.div>
          )}

          {/* Quick Reactions Overlay (Swipe Up) */}
          <AnimatePresence>
            {showReactions && (
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute inset-0 flex items-end justify-center z-40 story-controls"
              >
                <div className="w-full p-8 bg-black/60 backdrop-blur-xl rounded-t-[3rem] border-t border-white/10">
                  <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-8" />
                  <div className="grid grid-cols-3 gap-8 mb-8">
                    {REACTIONS.map((emoji) => (
                      <button 
                        key={emoji} 
                        onClick={() => handleReaction(emoji)}
                        className="text-5xl hover:scale-125 transition-transform active:scale-90"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => { setShowReactions(false); setIsPaused(false); }}
                    className="w-full py-4 text-xs font-black uppercase tracking-widest text-gray-500"
                  >
                    Chiudi
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Bottom Controls */}
        <div className="p-4 pb-10 md:pb-6 bg-black/20 backdrop-blur-sm story-controls z-50">
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
                  placeholder="Scrivi un messaggio..." 
                  className="flex-1 bg-zinc-900/80 border border-white/20 rounded-full py-3 px-6 text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button type="submit" className="bg-red-600 text-white p-3 rounded-full">
                  <Send size={18} />
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center"
              >
                <button 
                  onClick={() => { setShowInput(true); setIsPaused(true); }}
                  className="p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all active:scale-90"
                >
                  <MessageCircle size={28} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default StoryViewer;