"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Trash2, Loader2, Volume2, VolumeX, Send, Heart, Eye, User, Star, AtSign, RefreshCw } from 'lucide-react';
import { useStories, useStoryViews } from '@/hooks/use-stories';
import { useMessages } from '@/hooks/use-messages';
import { useAdmin } from '@/hooks/use-admin';
import { useBodyLock } from '@/hooks/use-body-lock';
import { supabase } from "@/integrations/supabase/client";
import { Input } from './ui/input';
import { showSuccess, showError } from '@/utils/toast';
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
}

const StoryViewer = ({ allStories, initialUserIndex, onClose }: StoryViewerProps) => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { role } = useAdmin();
  const [userIndex, setUserIndex] = useState(initialUserIndex);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [isMentionModalOpen, setIsMentionModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [isMediaLoading, setIsMediaLoading] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { deleteStory, recordView } = useStories();
  const { sendMessage } = useMessages();
  
  useBodyLock(true);

  useEffect(() => {
    const checkIOS = /iPhone|iPad|iPod/.test(window.navigator.userAgent);
    setIsIOS(checkIOS);

    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
      setIsAuthLoading(false);
    });
  }, []);

  const userStories = allStories[userIndex];
  const currentStory = userStories?.items[currentIndex];
  const isVideo = currentStory?.image_url.match(/\.(mp4|webm|ogg|mov)$/i) || currentStory?.image_url.includes('video');
  
  const isOwner = currentUserId === userStories?.user_id;
  const isHighlight = userStories?.role === 'highlight';

  const { data: views, isLoading: loadingViews } = useStoryViews(isOwner ? currentStory?.id : null);

  // Reset stato al cambio storia
  useEffect(() => {
    setProgress(0);
    setIsMediaLoading(true);
    setIsLiked(false);
  }, [currentStory?.id]);

  // Registrazione visualizzazione (solo se non owner e non highlight)
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
    if (progress >= 100 && !isVideo) {
      handleNext();
    }
  }, [progress, isVideo, handleNext]);

  const handleVideoTimeUpdate = () => {
    if (videoRef.current && !isShareModalOpen && !isHighlightModalOpen && !isMentionModalOpen && !showViewers) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const handleLike = async () => {
    if (isLiked || isOwner || !currentUserId) return;
    
    setIsLiked(true);
    try {
      await sendMessage.mutateAsync({
        receiverId: userStories.user_id,
        content: "❤️ Ha messo like alla tua storia",
        imageUrl: currentStory.image_url
      });
      showSuccess("Like inviato via Direct!");
    } catch (err) {
      setIsLiked(false);
      showError("Errore nell'invio del like");
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

  const handleShareClick = () => {
    if (!currentUserId) {
      navigate('/login');
      return;
    }
    if (role === 'subscriber') {
      showError(language === 'it' ? "L'inoltro delle storie è riservato ai membri ufficiali." : "Forwarding stories is reserved for official members.");
      return;
    }
    setIsShareModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentStory) return;
    
    if (confirm("Vuoi eliminare questa storia?")) {
      try {
        await deleteStory.mutateAsync(currentStory.id);
        if (userStories.items.length === 1) {
          handleNext();
        } else {
          setCurrentIndex(prev => Math.min(prev, userStories.items.length - 2));
        }
      } catch (err) {}
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isHighlight) return;
    onClose();
    navigate(`/profile/${userStories.user_id}`);
  };

  if (!userStories || !currentStory) return null;

  const roleLabel = isHighlight ? 'RACCOLTA' : (t.profile.roles[userStories.role] || t.profile.roles.member);
  const footerHeight = isIOS ? '50px' : '44px';

  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden touch-none"
      style={{ height: '100dvh', width: '100vw' }}
    >
      {/* Background Blur - Solo Desktop */}
      <div className="absolute inset-0 z-0 opacity-40 blur-[100px] scale-150 hidden md:block">
        <img src={currentStory.image_url} className="w-full h-full object-cover" alt="" />
      </div>

      {/* Main Container - Responsive */}
      <div className="relative w-full h-full md:h-[85vh] md:w-[420px] md:aspect-[9/16] bg-black md:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl md:border md:border-white/10">
        
        {/* Progress Bars */}
        <div className="absolute top-[calc(1rem+env(safe-area-inset-top))] md:top-6 left-4 right-4 z-50 flex gap-1.5">
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
        <div className="absolute top-[calc(2.5rem+env(safe-area-inset-top))] md:top-12 left-4 right-4 z-50 flex items-center justify-between">
          <button 
            onClick={handleProfileClick}
            className="flex items-center gap-3 group text-left"
          >
            <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden bg-zinc-800 group-hover:border-white transition-all">
              {userStories.avatar_url && (
                <img src={userStories.avatar_url} className="w-full h-full object-cover" alt="" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase italic tracking-widest text-white drop-shadow-lg group-hover:text-zinc-300 transition-colors">
                {userStories.username}
              </span>
              <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest">
                {roleLabel}
              </span>
            </div>
          </button>
          
          <div className="flex items-center gap-1">
            {isVideo && (
              <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-white/80 hover:text-white drop-shadow-md transition-all">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
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

        {/* Badge Ricondivisa */}
        {currentStory.reshared_from && (
          <div className="absolute top-[calc(6.5rem+env(safe-area-inset-top))] md:top-28 left-4 z-50 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
              <RefreshCw size={10} className="text-white/60" />
              <span className="text-[9px] font-black uppercase italic tracking-widest text-white">
                Ricondivisa da @{currentStory.reshared_from.username}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Areas */}
        <div className="absolute inset-0 z-20 flex">
          <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
          <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
        </div>

        {/* Media Content */}
        <div className="flex-1 relative flex items-center justify-center bg-black">
          {isMediaLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader2 className="animate-spin text-white/20" size={40} />
            </div>
          )}
          
          {isVideo ? (
            <video
              ref={videoRef}
              key={currentStory.id}
              src={currentStory.image_url}
              className="w-full h-full object-contain"
              autoPlay
              playsInline
              muted={isMuted}
              onLoadedData={() => setIsMediaLoading(false)}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleNext}
            />
          ) : (
            <img 
              key={currentStory.id}
              src={currentStory.image_url} 
              className="w-full h-full object-contain" 
              alt="Story" 
              onLoad={() => setIsMediaLoading(false)}
            />
          )}
        </div>

        {/* Footer Controls - Allineato con BottomNav */}
        <div 
          className="absolute bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-3xl border-t border-white/10"
          style={{ 
            height: footerHeight,
            paddingBottom: '0px',
            marginBottom: '0px'
          }}
        >
          <div className="h-full px-4 flex w-full max-w-md mx-auto items-center">
            {/* Aspettiamo che l'auth sia caricata per evitare flicker */}
            {!isAuthLoading && (
              <>
                {isOwner && !isHighlight ? (
                  <div className="flex items-center justify-around w-full">
                    <button onClick={() => setShowViewers(true)} className={cn("flex flex-col items-center gap-0.5 group", isIOS ? "h-[50px] justify-end pb-1" : "h-full justify-center")}>
                      <Eye size={isIOS ? 18 : 20} className="text-zinc-400 group-hover:text-white transition-colors" />
                      <span className="text-[6px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white">Attività</span>
                    </button>
                    
                    <button onClick={() => setIsMentionModalOpen(true)} className={cn("flex flex-col items-center gap-0.5 group", isIOS ? "h-[50px] justify-end pb-1" : "h-full justify-center")}>
                      <AtSign size={isIOS ? 18 : 20} className="text-zinc-400 group-hover:text-white transition-colors" />
                      <span className="text-[6px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white">Menziona</span>
                    </button>

                    <button onClick={() => setIsHighlightModalOpen(true)} className={cn("flex flex-col items-center gap-0.5 group", isIOS ? "h-[50px] justify-end pb-1" : "h-full justify-center")}>
                      <Star size={isIOS ? 18 : 20} className="text-zinc-400 group-hover:text-white transition-colors" />
                      <span className="text-[6px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white">Evidenza</span>
                    </button>

                    <button onClick={handleDelete} className={cn("flex flex-col items-center gap-0.5 group", isIOS ? "h-[50px] justify-end pb-1" : "h-full justify-center")}>
                      <Trash2 size={18} className="text-zinc-400 group-hover:text-red-500 transition-colors" />
                      <span className="text-[6px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-red-500">Elimina</span>
                    </button>
                  </div>
                ) : !isHighlight && (
                  <div className={cn("flex items-center gap-3 w-full h-full", isIOS ? "justify-end pb-1" : "justify-center")}>
                    <form onSubmit={handleReply} className="flex-1 flex gap-2">
                      <Input 
                        placeholder={`Rispondi a ${userStories.username}...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onFocus={() => videoRef.current?.pause()}
                        onBlur={() => videoRef.current?.play()}
                        className="bg-white/5 border-white/10 rounded-full h-8 px-4 text-[10px] font-bold uppercase tracking-widest text-white placeholder:text-zinc-600 focus-visible:ring-white/20"
                      />
                      {replyText.trim() && (
                        <button 
                          type="submit"
                          className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shrink-0 shadow-xl"
                        >
                          <Send size={12} />
                        </button>
                      )}
                    </form>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleLike}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all border",
                          isLiked ? "bg-red-500 border-red-500 text-white" : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                        )}
                      >
                        <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
                      </button>
                      <button 
                        onClick={handleShareClick}
                        className="w-8 h-8 bg-white/5 border border-white/10 text-zinc-400 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10 transition-all"
                      >
                        <Send size={14} className="-rotate-12" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Viewers Modal Overlay */}
        <AnimatePresence>
          {showViewers && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                onClick={() => setShowViewers(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
              />
              <motion.div 
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute inset-x-0 bottom-0 z-[61] bg-zinc-950 border-t border-white/10 rounded-t-[2rem] max-h-[60%] flex flex-col pb-15 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
                style={{ touchAction: 'pan-y' }}
              >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-lg font-black italic uppercase tracking-tighter">Visualizzazioni</h3>
                  <button onClick={() => setShowViewers(false)} className="p-2 text-zinc-500"><X size={24} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                  {loadingViews ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-zinc-500" /></div>
                  ) : views?.length === 0 ? (
                    <div className="text-center py-10 opacity-30">
                      <Eye size={40} className="mx-auto mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Nessuna visualizzazione</p>
                    </div>
                  ) : (
                    views?.map((view: any) => (
                      <button 
                        key={view.id} 
                        onClick={() => { onClose(); navigate(`/profile/${view.user_id}`); }}
                        className="w-full flex items-center justify-between p-3 bg-zinc-900/40 border border-white/5 rounded-2xl hover:bg-zinc-900 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-800 rounded-full overflow-hidden border border-white/10 group-hover:border-white transition-colors">
                            {view.profiles?.avatar_url ? (
                              <img src={view.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-700"><User size={20} /></div>
                            )}
                          </div>
                          <span className="text-xs font-black italic uppercase text-zinc-300 group-hover:text-white transition-colors">
                            {view.profiles?.username}
                          </span>
                        </div>
                        <span className="text-[8px] font-bold text-zinc-600 uppercase">
                          {new Date(view.viewed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Navigation Buttons */}
      <button 
        onClick={handlePrev}
        className="hidden md:flex fixed left-[calc(50%-320px)] top-1/2 -translate-y-1/2 w-14 h-14 items-center justify-center bg-white/5 hover:bg-white/20 rounded-full z-[10000] text-white transition-all border border-white/10 backdrop-blur-md shadow-2xl"
      >
        <ChevronLeft size={32} />
      </button>
      <button 
        onClick={handleNext}
        className="hidden md:flex fixed right-[calc(50%-320px)] top-1/2 -translate-y-1/2 w-14 h-14 items-center justify-center bg-white/5 hover:bg-white/20 rounded-full z-[10000] text-white transition-all border border-white/10 backdrop-blur-md shadow-2xl"
      >
        <ChevronRight size={32} />
      </button>

      <ShareStoryModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        storyUrl={currentStory.image_url}
        authorName={userStories.username}
      />

      {currentUserId && (
        <HighlightModal 
          isOpen={isHighlightModalOpen}
          onClose={() => setIsHighlightModalOpen(false)}
          story={currentStory}
          userId={currentUserId}
        />
      )}

      {isOwner && (
        <AddMentionModal 
          isOpen={isMentionModalOpen}
          onClose={() => setIsMentionModalOpen(false)}
          storyId={currentStory.id}
          storyUrl={currentStory.image_url}
          existingMentions={currentStory.mentions || []}
        />
      )}
    </motion.div>,
    document.body
  );
};

export default StoryViewer;