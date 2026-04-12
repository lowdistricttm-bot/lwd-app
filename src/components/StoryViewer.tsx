"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X, Send, MessageCircle, ChevronUp, MoreHorizontal } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

interface Story {
  id: string | number;
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
    if (progress >= 100) handleNext();
  }, [progress, handleNext]);

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 50;
    if (info.offset.x < -threshold) handleNext();
    else if (info.offset.x > threshold) handlePrev();
    else dragX.set(0);
  };

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
    if (x < width * 0.3) handlePrev();
    else handleNext();
  };

  return createPortal(
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] bg-black flex items-center justify-center touch-none overflow-hidden">
      <div className="relative w-full h-full md:max-w-[480px] md:h-[96vh] bg-black md:rounded-3xl overflow-hidden flex flex-col">
        <div className="absolute top-4 left-4 right-4 z-[60] flex gap-1.5">
          {stories.map((_, i) => (
            <div key={i} className="h-[2px] flex-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: i === currentIndex ? `${progress}%` : i < currentIndex ? '100%' : '0%' }} />
            </div>
          ))}
        </div>

        <div className="absolute top-10 left-4 right-4 z-[60] flex items-center justify-between story-controls">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10">
              <img src={stories[currentIndex].img} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="text-white font-black text-sm uppercase italic">{stories[currentIndex].name}</span>
          </div>
          <button onClick={onClose} className="text-white p-1"><X size={32} /></button>
        </div>

        <motion.div className="relative flex-1 w-full overflow-hidden bg-zinc-950" onClick={handleScreenClick} drag="x" dragConstraints={{ left: 0, right: 0 }} onDragStart={() => setIsPaused(true)} onDragEnd={handleDragEnd} style={{ x: dragX, opacity: dragOpacity }}>
          <AnimatePresence mode="wait">
            <motion.img key={currentIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} src={stories[currentIndex].img} className="w-full h-full object-cover pointer-events-none" />
          </AnimatePresence>
        </motion.div>

        <div className="p-6 pb-14 bg-black story-controls z-[80]">
          <div className="flex items-center gap-6">
            <button onClick={() => { setShowInput(true); setIsPaused(true); }} className="flex-1 bg-transparent border border-white/30 rounded-full py-4 px-6 text-white/60 text-left text-sm">Invia un messaggio...</button>
            <button onClick={() => showSuccess('Inviato!')} className="text-white/80"><Send size={28} /></button>
          </div>
        </div>
      </div>
    </motion.div>,
    document.body
  );
};

export default StoryViewer;