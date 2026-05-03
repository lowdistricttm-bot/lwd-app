"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Trash2, Loader2, Volume2, VolumeX, Send, Heart, Eye, User, Star, AtSign, RefreshCw, BookmarkX, Music } from 'lucide-react';
import { useStories, useStoryViews } from '@/hooks/use-stories';
import { useHighlights } from '@/hooks/use-highlights';
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
  currentUserId: string | null;
}

let globalMuteState = false;

// Componente per l'equalizzatore animato in stile Instagram
const MusicEqualizer = () => (
  <div className="flex items-end gap-[2px] h-2.5 w-2.5 mb-0.5">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        animate={{
          height: ["20%", "100%", "20%"],
        }}
        transition={{
          duration: 0.5 + i * 0.1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-[1.5px] bg-white rounded-full"
      />
    ))}
  </div>
);

// Utility per il calcolo del tempo trascorso
const getTimeAgo = (dateString: string) => {
  const now = new Date();
  const created = new Date(dateString);
  const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    return `${diffInMinutes} min`;
  }
  return `${diffInHours} h`;
};

const StoryViewer = ({ allStories, initialUserIndex, onClose, currentUserId }: StoryViewerProps) => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
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
  const { deleteStory, recordView, toggleStoryLike } = useStories();
  const { removeFromHighlight } = useHighlights(currentUserId || undefined);
  
  // Utilizziamo l'ID dell'utente corrente della storia per inizializzare le chat
  const userStories = allStories[userIndex];
  const { sendMessage } = useMessages(userStories?.user_id);
  
  useBodyLock(true);

  const currentStory = userStories?.items[currentIndex];
  
  const nextStory = useMemo(() => {
    if (currentIndex < userStories?.items.length - 1) {
      return userStories.items[currentIndex + 1];
    } else if (userIndex < allStories.length - 1) {
      return allStories[userIndex + 1].items[0];
    }
    return null;
  }, [currentIndex, userIndex, allStories, userStories]);

  const isVideo = currentStory?.image_url.match(/\.(mp4|webm|ogg|mov)$/i) || currentStory?.image_url.includes('video');
  const isOwner = currentUserId !== null && currentUserId === userStories?.user_id;
  const isHighlight = userStories?.role === 'highlight';

  const { data: views } = useStoryViews(isOwner && !isHighlight ? currentStory?.id : null);

  // Effetto per la riproduzione dell'audio
  useEffect(() => {
    if (storyAudioRef.current) {
      storyAudioRef.current.pause();
      storyAudioRef.current = null;
    }

    if (currentStory?.music_metadata?.audio_url) {
      const audio = new Audio(currentStory.music_metadata.audio_url);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = isMuted ? 0 : 0.5;
      
      audio.play().catch(() => console.log("Autoplay blocked"));
      
      storyAudioRef.current = audio;
    }

    return () => {
      storyAudioRef.current?.pause();
    };
  }, [currentStory?.id, isMuted]);

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

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newState = !isMuted;
    setIsMuted(newState);
    globalMuteState = newState;
    if (storyAudioRef.current) {
      storyAudioRef.current.volume = newState ? 0 : 0.5;
    }
  };

  const handleLike = async () => {
    if (isOwner || !currentUserId || currentStory.is_liked) return;
    toggleStoryLike.mutate({
      storyId: currentStory.id,
      authorId: userStories.user_id,
      imageUrl: currentStory.image_url,
      isCurrentlyLiked: false
    });
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentUserId || !userStories?.user_id) return;
    
    const textToSend = replyText;
    setReplyText(''); 
    
    try {
      await sendMessage.mutateAsync({
        receiverId: userStories.user_id,
        content: textToSend,
        imageUrl: currentStory.image_url
      });
      showSuccess("Risposta inviata!");
    } catch (err) {
      showError("Impossibile inviare la risposta. Riprova.");
      setReplyText(textToSend); // Ripristina il testo in caso di errore
    }
  };

  const handleShareClick = () => {
    if (!currentUserId) { navigate('/login'); return; }
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
        if (userStories.items.length === 1) handleNext();
        else setCurrentIndex(prev => Math.max(0, prev - 1));
      } catch (err) {}
    }
  };

  const handleRemoveFromHighlight = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isHighlight || !userStories.highlight_id) return;
    if (confirm("Vuoi rimuovere questa storia dai contenuti in evidenza?")) {
      try {
        await removeFromHighlight.mutateAsync({ 
          highlightId: userStories.highlight_id, 
          storyId: currentStory.id 
        });
        if (userStories.items.length === 1) onClose();
        else handleNext();
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
  
  const modalBottomOffset = "0px";

  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden touch-none"
    >
      <div className="relative w-full h-full md:h-[85vh] md:w-[420px] md:aspect-[9/16] bg-black md:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl md:border md:border-white/10 z-10">
        
        {/* Progress Bars */}
        <div className="absolute top-[calc(0.5rem+env(safe-area-inset-top))] md:top-6 left-4 right-4 z-50 flex gap-1.5">
          {userStories.items.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                style={{ width: i === currentIndex ? `${progress}%` : i < currentIndex ? '100%' : '0%' }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-[calc(2rem+env(safe-area-inset-top))] md:top-12 left-4 right-4 z-50 flex items-center justify-between">
          <button onClick={handleProfileClick} className="flex items-center gap-3 group text-left">
            <div className="w-10 h-10 rounded-full border-2 border-white/40 shadow-lg overflow-hidden bg-black group-hover:border-white transition-all">
              {userStories.avatar_url && <img src={userStories.avatar_url} className="w-full h-full object-cover" alt="" />}
            </div>
            <div className="flex flex-col drop-shadow-md">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black uppercase italic tracking-widest text-white drop-shadow-lg group-hover:text-zinc-300 transition-colors">
                  {userStories.username}
                </span>
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                  {getTimeAgo(currentStory.created_at)}
                </span>
              </div>
              
              <span className="text-[8px] font-bold text-white/80 uppercase tracking-widest">
                {roleLabel}
              </span>

              {currentStory.music_metadata && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1.5 mt-1"
                >
                  <MusicEqualizer />
                  <span className="text-[10px] font-bold text-white uppercase tracking-tight">
                    {currentStory.music_metadata.artist} · {currentStory.music_metadata.title}
                  </span>
                  <ChevronRight size={10} className="text-white/80" />
                </motion.div>
              )}
            </div>
          </button>
          
          <div className="flex items-center gap-1">
            {(isVideo || currentStory.music_metadata) && (
              <button onClick={toggleMute} className="p-2 text-white hover:text-zinc-300 drop-shadow-lg transition-all bg-black/40 rounded-full">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            )}
            <button onClick={onClose} className="p-2 text-white hover:text-zinc-300 transition-all drop-shadow-lg bg-black/40 rounded-full ml-2"><X size={24} /></button>
          </div>
        </div>

        {/* Navigation Layers */}
        <div className="absolute inset-0 z-20 flex">
          <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
          <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
        </div>

        {/* Media Container */}
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10 overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img 
              src={currentStory.image_url} 
              className="w-full h-full object-cover blur-[40px] opacity-40 scale-125" 
              alt="Blurred background" 
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStory.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex items-center justify-center relative z-10"
            >
              {isMediaLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <Loader2 className="animate-spin text-white/40" size={40} />
                </div>
              )}
              
              {isVideo ? (
                <video 
                  ref={videoRef} 
                  src={currentStory.image_url} 
                  className="w-full h-full object-contain" 
                  autoPlay 
                  playsInline 
                  preload="auto"
                  muted={isMuted} 
                  onCanPlay={() => setIsMediaLoading(false)}
                  onWaiting={() => setIsMediaLoading(true)}
                  onPlaying={() => setIsMediaLoading(false)}
                  onTimeUpdate={handleVideoTimeUpdate} 
                  onEnded={handleNext} 
                  onError={() => { setIsMediaLoading(false); handleNext(); }} 
                />
              ) : (
                <img 
                  src={currentStory.image_url} 
                  className="w-full h-full object-contain" 
                  alt="Story" 
                  onLoad={() => setIsMediaLoading(false)} 
                  onError={() => { setIsMediaLoading(false); handleNext(); }} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Bar / Interactions */}
        <div className="absolute bottom-0 left-0 right-0 z-50 select-none bg-gradient-to-t from-black via-black/80 to-transparent pt-32 pointer-events-none">
          <div className="px-4 flex w-full max-w-md mx-auto items-end pointer-events-auto pb-1">
            {isOwner ? (
              <div className="flex items-center justify-between w-full gap-2 mb-1">
                {!isHighlight && (
                  <>
                    <button onClick={() => setShowViewers(true)} className="flex-1 h-10 rounded-full bg-black border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all shadow-xl">
                      <Eye size={18} className="text-white" />
                    </button>
                    <button onClick={() => setIsMentionModalOpen(true)} className="flex-1 h-10 rounded-full bg-black border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all shadow-xl">
                      <AtSign size={18} className="text-white" />
                    </button>
                    <button onClick={() => setIsHighlightModalOpen(true)} className="flex-1 h-10 rounded-full bg-black border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all shadow-xl">
                      <Star size={18} className="text-white" />
                    </button>
                    <button onClick={handleDelete} className="flex-1 h-10 rounded-full bg-black border border-red-500/30 flex items-center justify-center hover:bg-red-500/20 transition-all shadow-xl">
                      <Trash2 size={18} className="text-red-500" />
                    </button>
                  </>
                )}
                {isHighlight && (
                  <button onClick={handleRemoveFromHighlight} className="w-full h-12 rounded-full bg-black border border-red-500/30 flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all shadow-xl">
                    <BookmarkX size={18} className="text-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Rimuovi</span>
                  </button>
                )}
              </div>
            ) : !isHighlight && (
              <div className="flex items-center gap-3 w-full mb-1">
                <form onSubmit={handleReply} className="flex-1 flex relative">
                  <Input 
                    placeholder={`Rispondi a ${userStories.username}...`} 
                    value={replyText} 
                    onChange={(e) => setReplyText(e.target.value)} 
                    onFocus={() => videoRef.current?.pause()} 
                    onBlur={() => videoRef.current?.play()} 
                    className="bg-black border border-white/20 rounded-full h-10 px-5 text-[11px] font-bold uppercase tracking-widest text-white placeholder:text-white/70 focus-visible:ring-white/40 shadow-xl" 
                  />
                  <AnimatePresence>
                    {(replyText.trim() || sendMessage.isPending) && (
                      <motion.button 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        type="submit" 
                        disabled={sendMessage.isPending}
                        className="absolute right-1 top-1 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shrink-0 shadow-lg"
                      >
                        {sendMessage.isPending ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Send size={12} className="-rotate-12 ml-0.5" />
                        )}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </form>
                <div className="flex items-center gap-2 shrink-0">
                  <motion.button 
                    whileTap={{ scale: 1.4 }}
                    onClick={handleLike} 
                    disabled={currentStory.is_liked || toggleStoryLike.isPending}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all border shadow-xl", 
                      currentStory.is_liked ? "bg-red-500 border-red-500 text-white" : "bg-black border-white/20 text-white hover:bg-white/20 hover:scale-105",
                      (currentStory.is_liked || toggleStoryLike.isPending) && "cursor-default"
                    )}
                  >
                    {toggleStoryLike.isPending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Heart size={18} fill={currentStory.is_liked ? "currentColor" : "none"} />
                    )}
                  </motion.button>
                  <button onClick={handleShareClick} className="w-10 h-10 bg-black border border-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/20 hover:scale-105 transition-all shadow-xl">
                    <Send size={18} className="-rotate-12 mr-0.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Viewers Bottom Sheet */}
        <AnimatePresence>
          {showViewers && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowViewers(false)} className="absolute inset-0 bg-black/80 z-[60]" />
              <motion.div 
                initial={{ y: '100%' }} 
                animate={{ y: 0 }} 
                exit={{ y: '100%' }} 
                transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
                className="absolute inset-x-0 z-[61] bg-black border-t border-white/10 rounded-t-[2.5rem] max-h-[60%] flex flex-col pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]" 
                style={{ 
                  touchAction: 'pan-y',
                  bottom: modalBottomOffset 
                }}
              >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-2 shrink-0" />
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-lg font-black italic uppercase tracking-tighter">Visualizzazioni</h3>
                  <button onClick={() => setShowViewers(false)} className="p-2 text-zinc-500"><X size={24} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                  {views?.length === 0 ? (
                    <div className="text-center py-10 opacity-30"><Eye size={40} className="mx-auto mb-2" /><p className="text-[10px] font-black uppercase tracking-widest">Nessuna visualizzazione</p></div>
                  ) : (
                    views?.map((view: any) => (
                      <button key={view.id} onClick={() => { onClose(); navigate(`/profile/${view.user_id}`); }} className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-black rounded-full overflow-hidden border border-white/10 group-hover:border-white transition-colors">{view.profiles?.avatar_url ? <img src={view.profiles.avatar_url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-zinc-700"><User size={20} /></div>}</div>
                          <span className="text-xs font-black italic uppercase text-zinc-300 group-hover:text-white transition-colors">{view.profiles?.username}</span>
                        </div>
                        <span className="text-[8px] font-bold text-zinc-600 uppercase">{new Date(view.viewed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <button onClick={handlePrev} className="hidden md:flex fixed left-[calc(50%-320px)] top-1/2 -translate-y-1/2 w-14 h-14 items-center justify-center bg-white/5 hover:bg-white/20 rounded-full z-[10000] text-white transition-all border border-white/10 shadow-2xl"><ChevronLeft size={32} /></button>
      <button onClick={handleNext} className="hidden md:flex fixed right-[calc(50%-320px)] top-1/2 -translate-y-1/2 w-14 h-14 items-center justify-center bg-white/5 hover:bg-white/20 rounded-full z-[10000] text-white transition-all border border-white/10 shadow-2xl"><ChevronRight size={32} /></button>

      <ShareStoryModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} storyUrl={currentStory.image_url} authorName={userStories.username} bottomOffset={modalBottomOffset} />
      {currentUserId && <HighlightModal isOpen={isHighlightModalOpen} onClose={() => setIsHighlightModalOpen(false)} story={currentStory} userId={currentUserId} bottomOffset={modalBottomOffset} />}
      {isOwner && !isHighlight && (
        <AddMentionModal 
          isOpen={isMentionModalOpen} 
          onClose={() => setIsMentionModalOpen(false)} 
          storyId={currentStory.id} 
          storyUrl={currentStory.image_url} 
          existingMentions={currentStory.mentions || []} 
          musicMetadata={currentStory.music_metadata}
          bottomOffset={modalBottomOffset} 
        />
      )}
    </motion.div>,
    document.body
  );
};

export default StoryViewer;