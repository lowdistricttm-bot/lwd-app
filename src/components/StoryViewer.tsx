"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
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

  // Valori per il trascinamento
  const dragX = useMotionValue(0);
  const dragOpacity = useTransform(dragX, [-100, 0, 100], [0.5, 1, 0.5]);

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
      setComment("");
      setShowInput(false);
      setShowReactions(false);
      setIsPaused(false);
      dragX.set(0);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose, dragX]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
      setComment("");
      setShowInput(false);
      setShowReactions(false);
      setIsPaused(false);
      dragX.set(0);
    } else {
      setProgress(0);
      dragX.set(0);
    }
  }, [currentIndex, dragX]);

  useEffect(() => {
    if (isPaused) return;

    const interval = 50;
    const increment = (interval / STORY_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
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

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      handleNext();
    } else if (info.offset.x > threshold) {
      handlePrev();
    } else {
      dragX.set(0);
    }
  };

  const handleScreenClick = (e: React.MouseEvent) => {
    // Evita il click se stiamo interagendo con i controlli o se c'è stato un trascinamento significativo
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

  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] bg-black flex items-center justify-center touch-none overflow-hidden"
    >
      <div className="relative w-full h-full md:max-w-[480px] md:h-[96vh] bg-black md:rounded-3xl overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.9)]">
        
        {/* Barre di progresso */}
        <div className="absolute top-4 left-4 right-4 z-[60] flex gap-1.5">
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
        <div className="absolute top-10 left-4 right-4 z-[60] flex items-center justify-between story-controls">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10">
              <img src={stories[currentIndex].img} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-sm leading-none uppercase italic tracking-tight">{stories[currentIndex].name}</span>
              <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-1">2 ore fa</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-white/80 hover:text-white transition-colors">
              <MoreHorizontal size={22} />
            </button>
            <button onClick={onClose} className="text-white p-1 hover:scale-110 transition-transform">
              <X size={32} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Area Immagine con supporto Swipe */}
        <motion.div 
          className="relative flex-1 w-full overflow-hidden bg-zinc-950 cursor-grab active:cursor-grabbing"
          onClick={handleScreenClick}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragStart={() => setIsPaused(true)}
          onDragEnd={handleDragEnd}
          style={{ x: dragX, opacity: dragOpacity }}
        >
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              src={stories[currentIndex].img} 
              alt="" 
              className="w-full h-full object-cover pointer-events-none"
            />
          </AnimatePresence>
          
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />

          {!showReactions && !showInput && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-32 left-0 right-0 flex flex-col items-center text-white/60 pointer-events-none"
            >
              <ChevronUp size={24} className="animate-bounce mb-1" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Reazioni</span>
            </motion.div>
          )}

          {/* Overlay Reazioni */}
          <AnimatePresence>
            {showReactions && (
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="absolute inset-0 flex items-end z-[70] story-controls"
              >
                <div className="w-full p-10 bg-black/95 backdrop-blur-2xl rounded-t-[3rem] border-t border-white/10">
                  <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-10" />
                  <div className="grid grid-cols-4 gap-y-12 gap-x-4 mb-12">
                    {REACTIONS.map((emoji) => (
                      <button 
                        key={emoji} 
                        onClick={() => { showSuccess(`Reazione ${emoji} inviata`); setShowReactions(false); setIsPaused(false); }}
                        className="text-5xl hover:scale-125 transition-transform active:scale-90"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer Controlli */}
        <div className="p-6 pb-14 md:pb-10 bg-black story-controls z-[80]">
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
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-full py-4 px-6 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-600"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button type="submit" className="text-red-600 font-black uppercase tracking-widest text-xs">Invia</button>
              </motion.form>
            ) : (
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => { setShowInput(true); setIsPaused(true); }}
                  className="flex-1 flex items-center gap-3 bg-transparent border border-white/30 rounded-full py-4 px-6 text-white/60 text-left"
                >
                  <span className="text-sm font-medium">Invia un messaggio...</span>
                </button>
                <button onClick={() => { setShowReactions(true); setIsPaused(true); }} className="text-white/80 hover:text-white transition-colors">
                  <MessageCircle size={28} strokeWidth={1.5} />
                </button>
                <button onClick={() => showSuccess('Inviato!')} className="text-white/80 hover:text-white transition-colors">
                  <Send size={28} strokeWidth={1.5} />
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>,
    document.body
  );
};

export default StoryViewer;