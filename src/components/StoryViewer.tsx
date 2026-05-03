"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Trash2, Loader2, Volume2, VolumeX, Send, Heart, Eye, User, Star, AtSign, RefreshCw, BookmarkX, Music, Check } from 'lucide-react';
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
import { useQueryClient } from '@tanstack/react-query';

interface StoryViewerProps {
  allStories: any[];
  initialUserIndex: number;
  onClose: () => void;
  currentUserId: string | null;
}

let globalMuteState = false;

const MusicEqualizer = () => (
  <div className="flex items-end gap-[2px] h-2.5 w-2.5 mb-0.5">
    {[0, 1, 2].map((i) => (
      <motion.div key={i} animate={{ height: ["20%", "100%", "20%"] }} transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, ease: "easeInOut" }} className="w-[1.5px] bg-white rounded-full" />
    ))}
  </div>
);

const getTimeAgo = (dateString: string) => {
  const now = new Date();
  const created = new Date(dateString);
  const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
  if (diffInHours < 1) return `${Math.floor((now.getTime() - created.getTime()) / (1000 * 60))} min`;
  return `${diffInHours} h`;
};

const StoryViewer = ({ allStories, initialUserIndex, onClose, currentUserId }: StoryViewerProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, language } = useTranslation();
  const { role } = useAdmin();
  const [userIndex, setUserIndex] = useState(initialUserIndex);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(globalMuteState);
  const [replyText, setReplyText] = useState('');
  const [justSent, setJustSent] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [isMentionModalOpen, setIsMentionModalOpen] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [isMediaLoading, setIsMediaLoading] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const storyAudioRef = useRef<HTMLAudioElement | null>(null);
  const { deleteStory, recordView, toggleStoryLike } = useStories();
  const { removeFromHighlight } = useHighlights(currentUserId || undefined);
  const userStories = allStories[userIndex];
  const { sendMessage } = useMessages(userStories?.user_id);
  
  useBodyLock(true);
  const currentStory = userStories?.items[currentIndex];

  useEffect(() => {
    if (storyAudioRef.current) { storyAudioRef.current.pause(); storyAudioRef.current = null; }
    if (currentStory?.music_metadata?.audio_url) {
      const audio = new Audio(currentStory.music_metadata.audio_url);
      audio.loop = true; audio.volume = isMuted ? 0 : 0.5;
      audio.play().catch(() => {});
      storyAudioRef.current = audio;
    }
    return () => { storyAudioRef.current?.pause(); };
  }, [currentStory?.id, isMuted]);

  useEffect(() => { setProgress(0); setIsMediaLoading(true); }, [currentStory?.id, userIndex]);

  useEffect(() => {
    if (currentStory?.id && currentUserId && !isOwner && !isHighlight) recordView.mutate(currentStory.id);
  }, [currentStory?.id]);

  const handleNext = useCallback(() => {
    if (currentIndex < allStories[userIndex].items.length - 1) setCurrentIndex(prev => prev + 1);
    else if (userIndex < allStories.length - 1) { setUserIndex(prev => prev + 1); setCurrentIndex(0); }
    else onClose();
  }, [currentIndex, userIndex, allStories, onClose]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    else if (userIndex > 0) {
      const prevUserIndex = userIndex - 1;
      setUserIndex(prevUserIndex);
      setCurrentIndex(allStories[prevUserIndex].items.length - 1);
    }
  }, [currentIndex, userIndex, allStories]);

  useEffect(() => {
    if (isVideo || isShareModalOpen || isHighlightModalOpen || isMentionModalOpen || showViewers || !currentStory || isMediaLoading) return;
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + (50 / 10000) * 100;
        return next >= 100 ? 100 : next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [userIndex, currentIndex, isVideo, isShareModalOpen, isHighlightModalOpen, isMentionModalOpen, showViewers, currentStory, isMediaLoading]);

  useEffect(() => { if (progress >= 100 && !isVideo) handleNext(); }, [progress]);

  const isOwner = currentUserId === userStories?.user_id;
  const isHighlight = userStories?.role === 'highlight';
  const { data: views } = useStoryViews(isOwner && !isHighlight ? currentStory?.id : null);

  const handleLike = () => {
    if (isOwner || !currentUserId || currentStory.is_liked) return;
    toggleStoryLike.mutate({ storyId: currentStory.id, authorId: userStories.user_id, imageUrl: currentStory.image_url, isCurrentlyLiked: false });
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentUserId || !userStories?.user_id) return;
    const text = replyText;
    setReplyText(''); setJustSent(true);
    setTimeout(() => setJustSent(false), 2000);
    sendMessage.mutate({ receiverId: userStories.user_id, content: text, imageUrl: currentStory.image_url }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['chat'] }); queryClient.invalidateQueries({ queryKey: ['conversations'] }); }
    });
  };

  if (!userStories || !currentStory) return null;

  return createPortal(
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden touch-none">
      <div className="relative w-full h-full md:h-[85vh] md:w-[420px] bg-black md:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl md:border md:border-white/10">
        
        {/* Bars */}
        <div className="absolute top-[calc(0.5rem+env(safe-area-inset-top))] left-4 right-4 z-50 flex gap-1.5">
          {userStories.items.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white" style={{ width: i === currentIndex ? `${progress}%` : i < currentIndex ? '100%' : '0%' }} />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-[calc(2rem+env(safe-area-inset-top))] left-4 right-4 z-50 flex items-center justify-between">
          <button onClick={handleProfileClick} className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full border-2 border-white/40 overflow-hidden bg-black">
              {userStories.avatar_url && <img src={userStories.avatar_url} className="w-full h-full object-cover" />}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black uppercase italic text-white">{userStories.username}</span>
                <span className="text-[10px] font-bold text-white/60">{getTimeAgo(currentStory.created_at)}</span>
              </div>
              <span className="text-[8px] font-bold text-white/80 uppercase">{(t.profile.roles[userStories.role] || t.profile.roles.member)}</span>
            </div>
          </button>
          <button onClick={onClose} className="p-2 text-white bg-black/40 rounded-full"><X size={24} /></button>
        </div>

        {/* Media */}
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={currentStory.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex items-center justify-center">
              {isVideo ? (
                <video src={currentStory.image_url} className="w-full h-full object-contain" autoPlay playsInline muted={isMuted} onTimeUpdate={() => setProgress((videoRef.current?.currentTime || 0) / (videoRef.current?.duration || 1) * 100)} onEnded={handleNext} />
              ) : (
                <img src={currentStory.image_url} className="w-full h-full object-contain" onLoad={() => setIsMediaLoading(false)} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Interaction Layer */}
        <div className="absolute inset-0 z-20 flex">
          <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
          <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-black/80 to-transparent pt-32 p-4">
          {!isOwner && (
            <div className="flex items-center gap-3">
              <form onSubmit={handleReply} className="flex-1 flex relative">
                <Input placeholder={`Rispondi...`} value={replyText} onChange={e => setReplyText(e.target.value)} className="bg-black border-white/20 rounded-full h-10 px-5 text-white" />
                <button type="submit" disabled={justSent} className="absolute right-1 top-1 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center">
                  {justSent ? <Check size={12} className="text-green-600" /> : <Send size={12} className="-rotate-12" />}
                </button>
              </form>
              <button onClick={handleLike} className={cn("w-10 h-10 rounded-full flex items-center justify-center border", currentStory.is_liked ? "bg-red-500 border-red-500 text-white" : "bg-black border-white/20 text-white")}>
                <Heart size={18} fill={currentStory.is_liked ? "currentColor" : "none"} />
              </button>
            </div>
          )}
          {isOwner && (
            <div className="flex gap-2">
              <button onClick={() => setShowViewers(true)} className="flex-1 h-10 rounded-full bg-black border border-white/20 flex items-center justify-center text-white"><Eye size={18} /></button>
              <button onClick={handleDelete} className="flex-1 h-10 rounded-full bg-black border border-red-500/30 flex items-center justify-center text-red-500"><Trash2 size={18} /></button>
            </div>
          )}
        </div>
      </div>
    </motion.div>,
    document.body
  );
};

export default StoryViewer;