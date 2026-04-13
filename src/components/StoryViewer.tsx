"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Send, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useViewStory, useDeleteStory } from '@/hooks/use-stories';
import { showSuccess, showError } from '@/utils/toast';

interface Story {
  id: string;
  userId: string;
  name: string;
  img: string;
  views: number;
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

const STORY_DURATION = 5000;

const StoryViewer = ({ stories, initialIndex, onClose }: StoryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const viewStory = useViewStory();
  const deleteStory = useDeleteStory();

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
    }
  }, [currentIndex]);

  const handleDelete = async () => {
    if (!window.confirm("Vuoi davvero eliminare questa storia?")) return;
    
    setIsDeleting(true);
    try {
      await deleteStory.mutateAsync(stories[currentIndex].id);
      showSuccess("Storia eliminata");
      
      // Se è l'ultima storia, chiudi, altrimenti vai alla prossima
      if (stories.length === 1) {
        onClose();
      } else {
        handleNext();
      }
    } catch (err) {
      showError("Errore durante l'eliminazione");
    } finally {
      setIsDeleting(false);
    }
  };

  // Traccia visualizzazione
  useEffect(() => {
    if (user && stories[currentIndex]) {
      viewStory.mutate({ 
        storyId: stories[currentIndex].id, 
        userId: String(user.id) 
      });
    }
  }, [currentIndex, user, stories]);

  useEffect(() => {
    if (isDeleting) return;
    const interval = 50;
    const increment = (interval / STORY_DURATION) * 100;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + increment;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [currentIndex, isDeleting]);

  useEffect(() => {
    if (progress >= 100) handleNext();
  }, [progress, handleNext]);

  const isOwner = user && String(user.id) === String(stories[currentIndex].userId);

  return createPortal(
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.9 }} 
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
    >
      <div className="relative w-full h-full md:max-w-[450px] md:h-[90vh] bg-zinc-950 md:rounded-3xl overflow-hidden">
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-50 flex gap-1">
          {stories.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear" 
                style={{ width: i === currentIndex ? `${progress}%` : i < currentIndex ? '100%' : '0%' }} 
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-10 left-4 right-4 z-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-red-600 p-0.5">
              <img src={stories[currentIndex].img} className="w-full h-full object-cover rounded-full" alt="" />
            </div>
            <div>
              <p className="text-white font-black text-xs uppercase italic">{stories[currentIndex].name}</p>
              <div className="flex items-center gap-1 text-[8px] text-white/60 font-bold uppercase">
                <Eye size={10} /> {stories[currentIndex].views} visualizzazioni
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isOwner && (
              <button 
                onClick={handleDelete} 
                disabled={isDeleting}
                className="text-white/60 hover:text-red-600 transition-colors"
              >
                {isDeleting ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
              </button>
            )}
            <button onClick={onClose} className="text-white/80 hover:text-white"><X size={28} /></button>
          </div>
        </div>

        {/* Story Image */}
        <div className="w-full h-full flex items-center justify-center bg-black">
          <img src={stories[currentIndex].img} className="w-full h-full object-cover" alt="" />
        </div>

        {/* Navigation Taps */}
        <div className="absolute inset-0 flex">
          <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
          <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
        </div>

        {/* Footer Input */}
        <div className="absolute bottom-8 left-4 right-4 z-50 flex items-center gap-4">
          <div className="flex-1 bg-black/40 backdrop-blur-md border border-white/20 rounded-full px-6 py-3">
            <input 
              type="text" 
              placeholder="Invia un messaggio..." 
              className="bg-transparent border-none w-full text-xs text-white focus:ring-0 outline-none"
            />
          </div>
          <button className="text-white"><Send size={20} /></button>
        </div>
      </div>
    </motion.div>,
    document.body
  );
};

export default StoryViewer;