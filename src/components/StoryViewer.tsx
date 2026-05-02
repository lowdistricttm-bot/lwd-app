"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Trash2, Loader2, Volume2, VolumeX, Send, Eye, User, Star, AtSign, Music } from 'lucide-react';
import { useStories, useStoryViews } from '@/hooks/use-stories';
import { useHighlights } from '@/hooks/use-highlights';
import { useMessages } from '@/hooks/use-messages';
import { useAdmin } from '@/hooks/use-admin';
import { useBodyLock } from '@/hooks/use-body-lock';
import { Input } from './ui/input';
import ShareStoryModal from './ShareStoryModal';
import HighlightModal from './HighlightModal';
import AddMentionModal from './AddMentionModal';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/use-translation';

interface StoryViewerProps {
  allStories: any[];
  initialUserIndex: number;
  onClose: () => void;
  currentUserId: string | null;
}

let globalMuteState = false;

const StoryViewer = ({ allStories, initialUserIndex, onClose, currentUserId }: StoryViewerProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { role } = useAdmin();
  const [userIndex, setUserIndex] = useState(initialUserIndex);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(globalMuteState);
  const [replyText, setReplyText] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [isMentionModalOpen, setIsMentionModalOpen] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [isMediaLoading, setIsMediaLoading] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const storyAudioRef = useRef<HTMLAudioElement | null>(null);
  const { deleteStory, recordView } = useStories();
  const { removeFromHighlight } = useHighlights(currentUserId || undefined);
  
  useBodyLock(true);

  const userStories = allStories[userIndex];
  const currentStory = userStories?.items[currentIndex];
  
  const isVideo = currentStory?.image_url.match(/\.(mp4|webm|ogg|mov)$/i) || currentStory?.image_url.includes('video');
  const isOwner = currentUserId !== null && currentUserId === userStories?.user_id;
  const isHighlight = userStories?.role === 'highlight';

  const { data: views } = useStoryViews(isOwner && !isHighlight ? currentStory?.id : null);

  // --- GESTIONE AUDIO MUSICA ---
  useEffect(() => {
    if (storyAudioRef.current) {
      storyAudioRef.current.pause();
      storyAudioRef.current = null;
    }

    if (currentStory?.music_metadata?.audio_url) {
      const audio = new Audio(currentStory.music_metadata.audio_url);
      audio.loop = true;
      audio.volume = isMuted ? 0 : 0.5;
      
      if (!isMediaLoading) {
        audio.play().catch(() => console.log("Autoplay blocked"));
      }
      
      storyAudioRef.current = audio;
    }

    return () => {
      storyAudioRef.current?.pause();
    };
  }, [currentStory?.id, isMediaLoading, isMuted]);

  useEffect(() => {
    setProgress(0);
    setIsMediaLoading(true);
  }, [currentStory?.id, userIndex]);

  useEffect(() => {
    if (currentStory?.id && currentUserId && !isOwner && !isHighlight) {
      recordView.mutate(currentStory.id);
    }
  }, [currentStory?.id, currentUserId, isOwner, isHighlight, recordView]);

  const handleNext = useCallback(() => {
    if (currentIndex < allStories[userIndex].items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (userIndex < allStories.length - 1) {
      setUserIndex(prev => prev + 1);
      setCurrentIndex(0);
    } else {
      onClose();
    }
  }, [currentIndex, userIndex, allStories, onClose]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else if (userIndex > 0) {
      const prevUserIndex = userIndex - 1;
      setUserIndex(prevUserIndex);
      setCurrentIndex(allStories[prevUserIndex].items.length - 1);
    }
  }, [currentIndex, userIndex, allStories]);

  useEffect(() => {
    if (isVideo || isShareModalOpen || isHighlightModalOpen || isMentionModalOpen || showViewers || !currentStory || isMediaLoading) return;
    const duration = 10000;
    const interval = 50; 
    const increment = (interval / duration) * 100;
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        return next >= 100 ? 100 : next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [userIndex, currentIndex, isVideo, isShareModalOpen, isHighlightModalOpen, isMentionModalOpen, showViewers, currentStory, isMediaLoading]);

  useEffect(() => {
    if (progress >= 100 && !isVideo) handleNext();
  }, [progress, isVideo, handleNext]);

  const handleVideoTimeUpdate = () => {
    if (videoRef.current && !isShareModalOpen && !isHighlightModalOpen && !isMentionModalOpen && !showViewers) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newState = !isMuted;
    setIsMuted(newState);
    globalMuteState = newState;
    if (storyAudioRef.current) storyAudioRef.current.volume = newState ? 0 : 0.5;
  };

  if (!userStories || !currentStory) return null;

  return createPortal(
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden touch-none">
      <div className="relative w-full h-full md:h-[85vh] md:w-[420px] bg-black md:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl md:border md:border-white/10 z-10">
        
        {/* Progress Bars */}
        <div className="absolute top-[calc(0.5rem+env(safe-area-inset-top))] md:top-6 left-4 right-4 z-50 flex gap-1.5">
          {userStories.items.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: i === currentIndex ? `${progress}%` : i < currentIndex ? '100%' : '0%' }} />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-[calc(2rem+env(safe-area-inset-top))] md:top-12 left-4 right-4 z-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-white/40 overflow-hidden bg-black">
              {userStories.avatar_url && <img src={userStories.avatar_url} className="w-full h-full object-cover" />}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase italic text-white">{userStories.username}</span>
              <span className="text-[8px] font-bold text-white/80 uppercase">
                {isHighlight ? 'RACCOLTA' : (userStories.role || 'MEMBRO')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleMute} className="p-2 text-white bg-black/40 rounded-full">
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button onClick={onClose} className="p-2 text-white bg-black/40 rounded-full ml-2"><X size={24} /></button>
          </div>
        </div>

        {/* Music Sticker */}
        {currentStory.music_metadata && (
          <motion.div 
            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="absolute top-32 left-4 z-50 flex items-center gap-2 bg-black/40 backdrop-blur-md p-2 pr-4 rounded-full border border-white/10"
          >
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black animate-spin-slow">
              <Music size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase italic text-white leading-none">{currentStory.music_metadata.title}</span>
              <span className="text-[7px] font-bold uppercase text-white/60 leading-none mt-1">{currentStory.music_metadata.artist}</span>
            </div>
          </motion.div>
        )}

        {/* Navigation Layers */}
        <div className="absolute inset-0 z-20 flex">
          <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
          <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
        </div>

        {/* Main Content */}
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          {isMediaLoading && <Loader2 className="animate-spin text-white/40" size={40} />}
          {isVideo ? (
            <video 
              ref={videoRef} src={currentStory.image_url} className="w-full h-full object-contain" 
              autoPlay playsInline muted={isMuted} 
              onCanPlay={() => setIsMediaLoading(false)} onTimeUpdate={handleVideoTimeUpdate} onEnded={handleNext} 
            />
          ) : (
            <img src={currentStory.image_url} className="w-full h-full object-contain" onLoad={() => setIsMediaLoading(false)} />
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-black/80 to-transparent p-6 pt-20 pointer-events-none">
          {isOwner ? (
            <div className="flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-4">
                {!isHighlight && (
                  <button onClick={() => setShowViewers(true)} className="flex flex-col items-center gap-1 text-white">
                    <div className="flex -space-x-2">
                      {views?.slice(0, 3).map((v: any, i: number) => (
                        <div key={i} className="w-6 h-6 rounded-full border border-black overflow-hidden bg-zinc-800">
                          {v.profiles?.avatar_url ? <img src={v.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={12} className="m-auto" />}
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] font-black uppercase italic flex items-center gap-1">
                      <Eye size={12} /> {views?.length || 0}
                    </span>
                  </button>
                )}
                <button onClick={() => setIsHighlightModalOpen(true)} className="flex flex-col items-center gap-1 text-white">
                  <Star size={20} className={cn(currentStory.is_highlighted && "fill-yellow-400 text-yellow-400")} />
                  <span className="text-[8px] font-black uppercase italic">In evidenza</span>
                </button>
              </div>
              
              <div className="flex items-center gap-4">
                {!isHighlight && (
                  <button onClick={() => setIsMentionModalOpen(true)} className="flex flex-col items-center gap-1 text-white">
                    <AtSign size={20} />
                    <span className="text-[8px] font-black uppercase italic">Menziona</span>
                  </button>
                )}
                <button onClick={() => setIsShareModalOpen(true)} className="flex flex-col items-center gap-1 text-white">
                  <Send size={20} />
                  <span className="text-[8px] font-black uppercase italic">Invia</span>
                </button>
                <button 
                  onClick={() => {
                    if (isHighlight) {
                      removeFromHighlight.mutate({ storyId: currentStory.id });
                    } else {
                      deleteStory.mutate(currentStory.id);
                    }
                    handleNext();
                  }} 
                  className="flex flex-col items-center gap-1 text-red-500"
                >
                  <Trash2 size={20} />
                  <span className="text-[8px] font-black uppercase italic">Elimina</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 pointer-events-auto">
              <Input 
                placeholder="Rispondi..." value={replyText} onChange={(e) => setReplyText(e.target.value)}
                className="bg-black/40 border-white/20 rounded-full h-12 text-white font-bold uppercase text-[10px]" 
              />
              <button className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shrink-0"><Send size={18} className="-rotate-12" /></button>
            </div>
          )}
        </div>
      </div>

      <button onClick={handlePrev} className="hidden md:flex fixed left-[calc(50%-320px)] top-1/2 -translate-y-1/2 w-14 h-14 items-center justify-center bg-white/5 rounded-full z-[10000] text-white border border-white/10"><ChevronLeft size={32} /></button>
      <button onClick={handleNext} className="hidden md:flex fixed right-[calc(50%-320px)] top-1/2 -translate-y-1/2 w-14 h-14 items-center justify-center bg-white/5 rounded-full z-[10000] text-white border border-white/10"><ChevronRight size={32} /></button>

      {/* Modals */}
      <ShareStoryModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} storyUrl={currentStory.image_url} />
      <HighlightModal isOpen={isHighlightModalOpen} onClose={() => setIsHighlightModalOpen(false)} storyId={currentStory.id} />
      <AddMentionModal isOpen={isMentionModalOpen} onClose={() => setIsMentionModalOpen(false)} storyId={currentStory.id} storyUrl={currentStory.image_url} />
      
      {/* Viewers Modal */}
      <AnimatePresence>
        {showViewers && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowViewers(false)} className="fixed inset-0 bg-black/60 z-[10001] backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-x-0 bottom-0 z-[10002] bg-zinc-950 rounded-t-[2.5rem] p-8 max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black uppercase italic text-white">Visualizzazioni ({views?.length || 0})</h3>
                <button onClick={() => setShowViewers(false)} className="p-2 bg-white/5 rounded-full text-white"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                {views?.map((view: any) => (
                  <div key={view.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-900">
                        {view.profiles?.avatar_url ? <img src={view.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="m-auto text-zinc-700" />}
                      </div>
                      <span className="text-sm font-bold text-white uppercase">{view.profiles?.username}</span>
                    </div>
                  </div>
                ))}
                {(!views || views.length === 0) && <p className="text-zinc-500 text-center py-10 font-bold uppercase text-xs">Nessuna visualizzazione ancora</p>}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>,
    document.body
  );
};

export default StoryViewer;