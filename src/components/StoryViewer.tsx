"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Trash2, Loader2, Volume2, VolumeX, Send, Heart, Eye, User, Star, AtSign, RefreshCw } from 'lucide-react';
import { useStories, useStoryViews } from '@/hooks/use-stories';
import { useMessages } from '@/hooks/use-messages';
import { useAdmin } from '@/hooks/use-admin';
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
  const [isMuted, setIsMuted] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [isMentionModalOpen, setIsMentionModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [isMediaLoading, setIsMediaLoading] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { deleteStory, recordView } = useStories();
  const { sendMessage } = useMessages();
  
  const userStories = allStories[userIndex];
  const currentStory = userStories?.items[currentIndex];
  const isVideo = currentStory?.image_url.match(/\.(mp4|webm|ogg|mov)$/i) || currentStory?.image_url.includes('video');
  
  const isOwner = currentUserId === userStories?.user_id;
  const isHighlight = userStories?.role === 'highlight';

  const { data: views, isLoading: loadingViews } = useStoryViews(isOwner ? currentStory?.id : null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (currentStory?.id && currentUserId && !isOwner && !isHighlight) {
      recordView.mutate(currentStory.id);
    }
    setProgress(0);
    setIsMediaLoading(true);
    setIsLiked(false);
  }, [currentStory?.id, currentUserId, isOwner, isHighlight]);

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
  }, [progress, isVideo]);

  const handleNext = () => {
    if (currentIndex < userStories.items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (userIndex < allStories.length - 1) {
      setUserIndex(prev => prev + 1);
      setCurrentIndex(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else if (userIndex > 0) {
      const prevUserIndex = userIndex - 1;
      setUserIndex(prevUserIndex);
      setCurrentIndex(allStories[prevUserIndex].items.length - 1);
    }
  };

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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden touch-none"
    >
      <div className="absolute inset-0 z-0 opacity-50 blur-[100px] scale-150">
        <img src={currentStory.image_url} className="w-full h-full object-cover" alt="" />
      </div>

      {/* STRUTTURA FLEX-COL PER IMPEDIRE LA SOVRAPPOSIZIONE */}
      <div className="relative w-full max-w-[500px] h-[100dvh] bg-black overflow-hidden flex flex-col shadow-2xl">
        
        {/* Sfondo Media (Immagine/Video) - Posizionato in modo assoluto dietro l'UI */}
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
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

        {/* Wrapper UI in Flexbox */}
        <div className="relative z-50 flex flex-col h-full pointer-events-none">
          
          {/* HEADER */}
          <div className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-auto shrink-0">
            <div className="flex gap-1.5 mb-4">
              {userStories.items.map((_, i) => (
                <div key={i} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                  <div 
                    className="h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    style={{ 
                      width: i === currentIndex ? `${progress}%` : i < currentIndex ? '100%' : '0%' 
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button 
                onClick={handleProfileClick}
                className="flex items-center gap-3 group text-left"
              >
                <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden bg-black/40 backdrop-blur-md group-hover:border-white transition-all shadow-lg">
                  {userStories.avatar_url && (
                    <img src={userStories.avatar_url} className="w-full h-full object-cover" alt="" />
                  )}
                </div>
                <div className="flex flex-col drop-shadow-md">
                  <span className="text-sm font-black uppercase italic tracking-widest text-white group-hover:text-zinc-300 transition-colors">
                    {userStories.username}
                  </span>
                  <span className="text-[8px] font-bold text-white/80 uppercase tracking-widest">
                    {roleLabel}
                  </span>
                </div>
              </button>
              
              <div className="flex items-center gap-1">
                {isVideo && (
                  <button onClick={() => setIsMuted(!isMuted)} className="p-2.5 bg-black/20 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-white/20 transition-all shadow-lg">
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                )}
                <button 
                  onClick={onClose} 
                  className="p-2.5 bg-black/20 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-white/20 transition-all shadow-lg ml-1"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {currentStory.reshared_from && (
              <div className="mt-4 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 w-fit shadow-lg">
                  <RefreshCw size={10} className="text-white/80" />
                  <span className="text-[9px] font-black uppercase italic tracking-widest text-white">
                    Ricondivisa da @{currentStory.reshared_from.username}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* TAP ZONES (Spacer) - Area per il tocco che spinge il footer in basso */}
          <div className="flex-1 flex pointer-events-auto">
            <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
            <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
          </div>

          {/* FOOTER */}
          <div className="p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-auto shrink-0 mt-auto">
            {isOwner && !isHighlight ? (
              <div className="flex items-center justify-around py-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-xl">
                <button onClick={() => setShowViewers(true)} className="flex flex-col items-center gap-1.5 group">
                  <Eye size={20} className="text-white group-hover:scale-110 transition-transform" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white">Attività</span>
                </button>
                
                <button onClick={() => setIsMentionModalOpen(true)} className="flex flex-col items-center gap-1.5 group">
                  <AtSign size={20} className="text-white group-hover:scale-110 transition-transform" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white">Menziona</span>
                </button>

                <button onClick={() => setIsHighlightModalOpen(true)} className="flex flex-col items-center gap-1.5 group">
                  <Star size={20} className="text-white group-hover:scale-110 transition-transform" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white">Evidenza</span>
                </button>

                <button onClick={handleDelete} className="flex flex-col items-center gap-1.5 group">
                  <Trash2 size={20} className="text-white group-hover:text-red-500 transition-colors" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white">Elimina</span>
                </button>
              </div>
            ) : !isHighlight && (
              <div className="flex items-center gap-3">
                <form onSubmit={handleReply} className="flex-1 relative">
                  <Input 
                    placeholder={`Rispondi a ${userStories.username}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onFocus={() => videoRef.current?.pause()}
                    onBlur={() => videoRef.current?.play()}
                    className="w-full bg-black/40 backdrop-blur-2xl border-white/10 rounded-full h-14 px-6 text-[10px] font-black uppercase tracking-widest text-white placeholder:text-white/60 focus-visible:ring-white/20 transition-all shadow-xl"
                  />
                  <AnimatePresence>
                    {replyText.trim() && (
                      <motion.button 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        type="submit"
                        className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                      >
                        <Send size={14} className="-rotate-12" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </form>
                
                <button 
                  onClick={handleLike}
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center transition-all backdrop-blur-2xl border shadow-xl shrink-0",
                    isLiked ? "bg-red-500 border-red-500 text-white" : "bg-black/40 border-white/10 text-white hover:bg-white/20"
                  )}
                >
                  <Heart size={22} fill={isLiked ? "currentColor" : "none"} className={cn(isLiked && "animate-bounce")} />
                </button>
                <button 
                  onClick={handleShareClick}
                  className="w-14 h-14 bg-black/40 backdrop-blur-2xl border border-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all shadow-xl shrink-0"
                >
                  <Send size={22} className="-rotate-12" />
                </button>
              </div>
            )}
          </div>
        </div>

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
                className="absolute inset-x-0 bottom-0 z-[61] bg-black/80 backdrop-blur-2xl border-t border-white/10 rounded-t-[2rem] max-h-[60%] flex flex-col shadow-2xl"
              >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-lg font-black italic uppercase tracking-tighter">Visualizzazioni</h3>
                  <button onClick={() => setShowViewers(false)} className="p-2 text-zinc-400 hover:text-white bg-white/5 rounded-full"><X size={20} /></button>
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
                        className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-black/40 rounded-full overflow-hidden border border-white/10 group-hover:border-white transition-colors">
                            {view.profiles?.avatar_url ? (
                              <img src={view.profiles.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-500"><User size={20} /></div>
                            )}
                          </div>
                          <span className="text-xs font-black italic uppercase text-zinc-300 group-hover:text-white transition-colors">
                            {view.profiles?.username}
                          </span>
                        </div>
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
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

        <button 
          onClick={handlePrev}
          className="hidden md:flex absolute -left-20 top-1/2 -translate-y-1/2 w-14 h-14 items-center justify-center bg-white/5 hover:bg-white/20 rounded-full z-30 text-white transition-all border border-white/10 backdrop-blur-md shadow-xl"
        >
          <ChevronLeft size={32} />
        </button>
        <button 
          onClick={handleNext}
          className="hidden md:flex absolute -right-20 top-1/2 -translate-y-1/2 w-14 h-14 items-center justify-center bg-white/5 hover:bg-white/20 rounded-full z-30 text-white transition-all border border-white/10 backdrop-blur-md shadow-xl"
        >
          <ChevronRight size={32} />
        </button>
      </div>

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
    </motion.div>
  );
};

export default StoryViewer;