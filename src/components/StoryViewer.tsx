"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Trash2, Eye, AtSign, BookmarkX, Star, Send, Heart, Check, Camera } from 'lucide-react';
import { useStories, useStoryViews } from '@/hooks/use-stories';
import { useHighlights } from '@/hooks/use-highlights';
import { useMessages } from '@/hooks/use-messages';
import { supabase } from "@/integrations/supabase/client";
import { Input } from './ui/input';
import { useTranslation } from '@/hooks/use-translation';
import HighlightModal from './HighlightModal';
import AddMentionModal from './AddMentionModal';

const StoryViewer = ({ allStories, initialUserIndex, onClose, currentUserId }: any) => {
  const { t } = useTranslation();
  const [userIndex, setUserIndex] = useState(initialUserIndex);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [justSent, setJustSent] = useState(false);
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [isMentionModalOpen, setIsMentionModalOpen] = useState(false);
  const [showViewers, setShowViewers] = useState(false);

  const userStories = allStories[userIndex];
  const currentStory = userStories?.items[currentIndex];
  const isOwner = currentUserId === userStories?.user_id;
  const isHighlight = userStories?.role === 'highlight';
  const { deleteStory, recordView, toggleStoryLike } = useStories();

  const handleNext = useCallback(() => {
    if (currentIndex < userStories.items.length - 1) setCurrentIndex(prev => prev + 1);
    else if (userIndex < allStories.length - 1) { setUserIndex(prev => prev + 1); setCurrentIndex(0); }
    else onClose();
  }, [currentIndex, userIndex, allStories, onClose, userStories]);

  useEffect(() => { setProgress(0); }, [currentStory?.id]);
  useEffect(() => {
    if (currentStory && !isOwner) {
      const interval = setInterval(() => {
        setProgress(p => { if(p >= 100) { handleNext(); return 100; } return p + 1; });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [currentStory?.id, isOwner, handleNext]);

  if (!userStories || !currentStory) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      <div className="relative w-full h-full md:h-[85vh] md:w-[420px] bg-zinc-950 overflow-hidden flex flex-col md:rounded-[2.5rem]">
        {/* Progress Bar */}
        <div className="absolute top-4 left-4 right-4 z-50 flex gap-1">
          {userStories.items.map((_: any, i: number) => (
            <div key={`prog-${i}`} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all duration-100" style={{ width: i === currentIndex ? `${progress}%` : i < currentIndex ? '100%' : '0%' }} />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 z-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden"><img src={userStories.avatar_url} className="w-full h-full object-cover" /></div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white italic uppercase">{userStories.username}</span>
              <span className="text-[8px] font-black text-white/60 uppercase">{t.profile.roles[userStories.role] || 'Member'}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white bg-black/40 rounded-full"><X size={24} /></button>
        </div>

        {/* Media */}
        <div className="flex-1 bg-black flex items-center justify-center">
          <img src={currentStory.image_url} className="w-full object-contain" alt="" />
        </div>

        {/* Toolbar di gestione per il proprietario */}
        <div className="absolute bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
          {isOwner && !isHighlight ? (
            <div className="flex gap-2">
              <button onClick={() => setIsMentionModalOpen(true)} className="flex-1 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white"><AtSign size={20} /></button>
              <button onClick={() => setIsHighlightModalOpen(true)} className="flex-1 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white"><Star size={20} /></button>
              <button onClick={() => setShowViewers(true)} className="flex-1 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white"><Eye size={20} /></button>
              <button onClick={() => { if(confirm("Eliminare?")) deleteStory.mutate(currentStory.id); }} className="flex-1 h-12 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30 flex items-center justify-center text-red-500"><Trash2 size={20} /></button>
            </div>
          ) : !isOwner && (
            <div className="flex items-center gap-3">
               <Input placeholder="Rispondi..." className="bg-white/10 border-white/20 text-white rounded-full h-12" />
               <button className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center"><Heart size={20} /></button>
            </div>
          )}
        </div>
      </div>
      {isMentionModalOpen && <AddMentionModal isOpen={isMentionModalOpen} onClose={() => setIsMentionModalOpen(false)} storyId={currentStory.id} storyUrl={currentStory.image_url} existingMentions={currentStory.mentions || []} />}
      {isHighlightModalOpen && <HighlightModal isOpen={isHighlightModalOpen} onClose={() => setIsHighlightModalOpen(false)} story={currentStory} userId={currentUserId} />}
    </div>,
    document.body
  );
};

export default StoryViewer;