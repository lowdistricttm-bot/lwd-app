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
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center touch-none"
    >
      <div className="relative w-full h-full md:max-w-[420px] md:h-[92vh] bg-black md:rounded-xl overflow-hidden flex flex-col">
        
        <div className="absolute top-3 left-2 right-2 z-30 flex gap-1">
          {stories.map((_, i) => (
            <div key={i} className="h-[2px] flex-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ 
                  width: i === currentIndex ? `${progress}%` : i < currentIndex ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        <div className="absolute top-6 left-4 right-4 z-30 flex items-center justify-between story-controls">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
              <img src={stories[currentIndex].img} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-[13px]">{stories[currentIndex].name}</span>
              <span className="text-white/60 text-[13px]">2h</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MoreHorizontal size={20} className="text-white" />
            <button onClick={onClose} className="text-white p-1">
              <X size={26} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div 
          className="relative flex-1 w-full overflow-hidden"
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
          
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 pointer-events-none" />

          {!showReactions && !showInput && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-24 left-0 right-0 flex flex-col items-center text-white/80 pointer-events-none"
            >
              <ChevronUp size={18} className="animate-bounce mb-1" />
              <span className="text-[10px] font-medium tracking-wider">Reazioni</span>
            </motion.div>
          )}

          <AnimatePresence>
            {showReactions && (
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="absolute inset-0 flex items-end z-40 story-controls"
              >
                <div className="w-full p-6 bg-black/80 backdrop-blur-2xl rounded-t-3xl border-t border-white/10">
                  <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-8" />
                  <div className="grid grid-cols-4 gap-y-8 gap-x-4 mb-10">
                    {REACTIONS.map((emoji) => (
                      <button 
                        key={emoji} 
                        onClick={() => { showSuccess(`Reazione ${emoji} inviata`); setShowReactions(false); setIsPaused(false); }}
                        className="text-4xl hover:scale-110 transition-transform active:scale-90"
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

        <div className="p-4 pb-10 md:pb-6 bg-black story-controls z-50">
          <AnimatePresence mode="wait">
            {showInput ? (
              <motion.form 
                key="input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onSubmit={handleSendMessage} 
                className="flex items-center gap-3"
              >
                <input 
                  autoFocus
                  type="text" 
                  placeholder={`Invia un messaggio...`} 
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-full py-2.5 px-5 text-[13px] text-white focus:outline-none"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button type="submit" className="text-white font-semibold text-[13px]">Invia</button>
              </motion.form>
            ) : (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { setShowInput(true); setIsPaused(true); }}
                  className="flex-1 flex items-center gap-3 bg-transparent border border-white/40 rounded-full py-2.5 px-5 text-white/80 text-left"
                >
                  <span className="text-[13px]">Invia un messaggio...</span>
                </button>
                <button onClick={() => { setShowInput(true); setIsPaused(true); }} className="text-white">
                  <MessageCircle size={24} strokeWidth={1.5} />
                </button>
                <button onClick={() => showSuccess('Inviato!')} className="text-white">
                  <Send size={24} strokeWidth={1.5} />
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