"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Trash2, Loader2, Volume2, VolumeX } from 'lucide-react';
import { useStories } from '@/hooks/use-stories';
import { supabase } from "@/integrations/supabase/client";

interface StoryViewerProps {
  userStories: {
    user_id: string;
    username: string;
    avatar_url?: string;
    items: Array<{
      id: string;
      image_url: string;
    }>;
  };
  onClose: () => void;
}

const StoryViewer = ({ userStories, onClose }: StoryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { deleteStory } = useStories();
  
  const currentStory = userStories.items[currentIndex];
  const isVideo = currentStory?.image_url.match(/\.(mp4|webm|ogg|mov)$/i) || currentStory?.image_url.includes('video');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  useEffect(() => {
    setProgress(0);
    if (isVideo) {
      setIsVideoLoading(true);
    }
  }, [currentIndex, isVideo]);

  useEffect(() => {
    if (isVideo) return; // Se è un video, il progresso è gestito da onTimeUpdate

    const duration = 15000; // 15 secondi per le immagini
    const interval = 50; 
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 100;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isVideo]);

  const handleNext = () => {
    if (currentIndex < userStories.items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentStory) return;
    
    try {
      await deleteStory.mutateAsync(currentStory.id);
      if (userStories.items.length === 1) {
        onClose();
      } else {
        handleNext();
      }
    } catch (err) {}
  };

  const isOwner = currentUserId === userStories.user_id;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
    >
      <div className="relative w-full max-w-lg h-full md:h-[90vh] bg-zinc-900 overflow-hidden md:rounded-3xl flex flex-col">
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-30 flex gap-1">
          {userStories.items.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ 
                  width: i === currentIndex ? `${progress}%` : i < currentIndex ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden bg-zinc-800">
              {userStories.avatar_url && (
                <img src={userStories.avatar_url} className="w-full h-full object-cover" alt="" />
              )}
            </div>
            <span className="text-xs font-black uppercase italic tracking-widest text-white drop-shadow-md">
              {userStories.username}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {isVideo && (
              <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-white/70 hover:text-white drop-shadow-md">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            )}
            {isOwner && (
              <button 
                onClick={handleDelete}
                disabled={deleteStory.isPending}
                className="p-2 text-white/70 hover:text-red-600 transition-colors drop-shadow-md"
              >
                {deleteStory.isPending ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-2 text-white/70 hover:text-white transition-colors drop-shadow-md"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Navigation Areas (Touch) */}
        <div className="absolute inset-0 z-20 flex">
          <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
          <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
        </div>

        {/* Media Content */}
        <div className="flex-1 relative flex items-center justify-center">
          {isVideoLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader2 className="animate-spin text-white/20" size={40} />
            </div>
          )}
          
          {isVideo ? (
            <video
              ref={videoRef}
              src={currentStory.image_url}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted={isMuted}
              onLoadedData={() => setIsVideoLoading(false)}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleNext}
            />
          ) : (
            <img 
              src={currentStory.image_url} 
              className="w-full h-full object-cover" 
              alt="Story" 
            />
          )}
        </div>

        {/* Desktop Controls */}
        <button 
          onClick={handlePrev}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-black/20 hover:bg-black/40 rounded-full z-30 text-white transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={handleNext}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-black/20 hover:bg-black/40 rounded-full z-30 text-white transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </motion.div>
  );
};

export default StoryViewer;