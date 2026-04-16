"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Trash2, Loader2, Volume2, VolumeX, Send, Heart } from 'lucide-react';
import { useStories } from '@/hooks/use-stories';
import { useMessages } from '@/hooks/use-messages';
import { supabase } from "@/integrations/supabase/client";
import { Input } from './ui/input';
import { showSuccess, showError } from '@/utils/toast';
import ShareStoryModal from './ShareStoryModal';
import { cn } from '@/lib/utils';

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
  const [replyText, setReplyText] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { deleteStory } = useStories();
  const { sendMessage } = useMessages();
  
  const currentStory = userStories.items[currentIndex];
  const isVideo = currentStory?.image_url.match(/\.(mp4|webm|ogg|mov)$/i) || currentStory?.image_url.includes('video');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  useEffect(() => {
    if (isVideo || isShareModalOpen) return;

    const duration = 10000; // 10 secondi per le immagini
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
  }, [currentIndex, isVideo, isShareModalOpen]);

  const handleNext = () => {
    if (currentIndex < userStories.items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsLiked(false);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsLiked(false);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current && !isShareModalOpen) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentUserId) return;

    try {
      await sendMessage.mutateAsync({
        receiverId: userStories.user_id,
        content: replyText,
        imageUrl: currentStory.image_url
      });
      setReplyText('');
      showSuccess("Risposta inviata!");
    } catch (err) {
      showError("Errore nell'invio della risposta");
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentStory) return;
    
    if (confirm("Vuoi eliminare questa storia?")) {
      try {
        await deleteStory.mutateAsync(currentStory.id);
        if (userStories.items.length === 1) {
          onClose();
        } else {
          handleNext();
        }
      } catch (err) {}
    }
  };

  const isOwner = currentUserId === userStories.user_id;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
    >
      {/* Background Blur */}
      <div className="absolute inset-0 z-0 opacity-40 blur-3xl scale-110">
        <img src={currentStory.image_url} className="w-full h-full object-cover" alt="" />
      </div>

      <div className="relative w-full max-w-[450px] h-full md:h-[92vh] bg-zinc-950 overflow-hidden md:rounded-[2.5rem] flex flex-col shadow-2xl border border-white/5">
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-50 flex gap-1.5">
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
        <div className="absolute top-8 left-4 right-4 z-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border-2 border-white/20 overflow-hidden bg-zinc-800">
              {userStories.avatar_url && (
                <img src={userStories.avatar_url} className="w-full h-full object-cover" alt="" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase italic tracking-widest text-white drop-shadow-lg">
                {userStories.username}
              </span>
              <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest">
                Low District Member
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {isVideo && (
              <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-white/80 hover:text-white drop-shadow-md transition-all">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            )}
            {isOwner && (
              <button 
                onClick={handleDelete}
                disabled={deleteStory.isPending}
                className="p-2 text-white/80 hover:text-red-500 transition-all drop-shadow-md"
              >
                {deleteStory.isPending ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
              </button>
            )}
            <button 
              onClick={onClose} 
              className="p-2 text-white/80 hover:text-white transition-all drop-shadow-md"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Navigation Areas (Touch) */}
        <div className="absolute inset-0 z-20 flex">
          <div className="w-1/4 h-full cursor-pointer" onClick={handlePrev} />
          <div className="w-3/4 h-full cursor-pointer" onClick={handleNext} />
        </div>

        {/* Media Content */}
        <div className="flex-1 relative flex items-center justify-center bg-black">
          {isVideo ? (
            <video
              ref={videoRef}
              src={currentStory.image_url}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted={isMuted}
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

        {/* Footer Interaction */}
        <div className="absolute bottom-0 left-0 right-0 z-50 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-4">
            <form onSubmit={handleReply} className="flex-1 flex gap-2">
              <Input 
                placeholder={`Rispondi a ${userStories.username}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onFocus={() => videoRef.current?.pause()}
                onBlur={() => videoRef.current?.play()}
                className="bg-white/10 border-white/20 rounded-full h-12 px-6 text-xs font-bold uppercase tracking-widest text-white placeholder:text-white/40 focus-visible:ring-white/30 backdrop-blur-md"
              />
              {replyText.trim() && (
                <button 
                  type="submit"
                  className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shrink-0"
                >
                  <Send size={18} />
                </button>
              )}
            </form>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all backdrop-blur-md border border-white/10",
                  isLiked ? "bg-red-500 border-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
              </button>
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="w-12 h-12 bg-white/10 border border-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all backdrop-blur-md"
              >
                <Send size={20} className="-rotate-12" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Controls */}
        <button 
          onClick={handlePrev}
          className="hidden md:flex absolute -left-16 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center bg-white/10 hover:bg-white/20 rounded-full z-30 text-white transition-all border border-white/10"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={handleNext}
          className="hidden md:flex absolute -right-16 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center bg-white/10 hover:bg-white/20 rounded-full z-30 text-white transition-all border border-white/10"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <ShareStoryModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        storyUrl={currentStory.image_url}
        authorName={userStories.username}
      />
    </motion.div>
  );
};

export default StoryViewer;