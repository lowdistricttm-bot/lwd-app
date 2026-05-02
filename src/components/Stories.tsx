"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Loader2, User, ShieldCheck, ArrowRight, Swords } from 'lucide-react';
import { useStories } from '@/hooks/use-stories';
import { useAdmin } from '@/hooks/use-admin';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from "@/integrations/supabase/client";
import StoryViewer from './StoryViewer';
import MusicSelector from './MusicSelector';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { showError } from '@/utils/toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Stories = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { stories, isLoading, uploadStory } = useStories();
  const { role } = useAdmin();
  const { user: currentUser } = useAuth();
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isMusicSelectorOpen, setIsMusicSelectorOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  useEffect(() => {
    if (currentUser) {
      supabase.from('profiles').select('*').eq('id', currentUser.id).maybeSingle().then(({ data }) => {
        setUserProfile(data);
      });
    }
  }, [currentUser]);

  const isSubscriber = role === 'subscriber';
  const myStoriesGroup: any = (stories as any[])?.find((group: any) => group.user_id === currentUser?.id);
  const otherStories: any[] = (stories as any[])?.filter((group: any) => group.user_id !== currentUser?.id) || [];
  const combinedStories = myStoriesGroup ? [myStoriesGroup, ...otherStories] : otherStories;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (isSubscriber) {
      showError("Solo i membri ufficiali possono pubblicare storie.");
      return;
    }

    setPendingFiles(files);
    setIsMusicSelectorOpen(true);
  };

  const handleUploadWithMusic = async (musicMetadata?: any) => {
    if (pendingFiles.length === 0) return;
    try {
      await uploadStory.mutateAsync({ 
        files: pendingFiles, 
        music_metadata: musicMetadata 
      });
    } catch (err) {
      console.error(err);
    } finally {
      setPendingFiles([]);
      setIsMusicSelectorOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleStoryClick = (index: number) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
    } else {
      setSelectedIndex(index);
    }
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto no-scrollbar py-4 items-center min-h-[120px] px-6 bg-gradient-to-b from-black via-black/95 to-zinc-950/20 border-b border-white/5">
        
        {/* BARRA DI CONTROLLO UTENTE (TUA STORIA) */}
        {currentUser && (
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" multiple onChange={handleFileSelect} />
              <button 
                onClick={() => {
                  if (myStoriesGroup) handleStoryClick(0);
                  else if (!isSubscriber) fileInputRef.current?.click();
                }}
                className={cn(
                  "w-16 h-16 rounded-full border-[2.5px] flex items-center justify-center bg-zinc-900 overflow-hidden transition-all",
                  myStoriesGroup ? "border-white" : "border-zinc-800"
                )}
              >
                {uploadStory.isPending ? (
                  <Loader2 className="animate-spin text-zinc-400" size={20} />
                ) : (myStoriesGroup?.avatar_url || userProfile?.avatar_url) ? (
                  <img src={myStoriesGroup?.avatar_url || userProfile?.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                    <User size={24} className="text-zinc-600" />
                  </div>
                )}
              </button>
              {!isSubscriber && (
                <button 
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="absolute bottom-0 right-0 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-black shadow-lg"
                >
                  <Plus size={12} className="text-black font-bold" />
                </button>
              )}
            </div>
            <div className="flex flex-col items-center">
              <span className="text-white text-[8px] font-black uppercase tracking-widest italic">La tua storia</span>
              <span className="text-zinc-500 text-[6px] font-bold uppercase tracking-tighter">{role || 'MEMBER'}</span>
            </div>
          </div>
        )}

        {/* SEZIONE BATTLES */}
        <div onClick={() => navigate('/battles')} className="flex flex-col items-center gap-2 cursor-pointer shrink-0 group">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-600 to-yellow-400 p-[2px] animate-pulse">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center border-2 border-black">
                <Swords size={24} className="text-yellow-500 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-red-600 text-[7px] font-black px-1.5 py-0.5 rounded-full border border-black uppercase italic">Live</div>
          </div>
          <span className="text-[9px] font-black uppercase italic text-yellow-500 tracking-tighter">Vota</span>
        </div>

        {/* STORIE DEGLI ALTRI UTENTI CON RUOLO */}
        {otherStories.map((userGroup: any, index: number) => {
          const actualIndex = myStoriesGroup ? index + 1 : index;
          const key = `story-group-${userGroup.user_id || 'unknown'}-${index}`;
          return (
            <button key={key} onClick={() => handleStoryClick(actualIndex)} className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-zinc-700 via-zinc-400 to-white">
                <div className="w-full h-full rounded-full border-[2.5px] border-black overflow-hidden bg-zinc-900">
                  {userGroup.avatar_url ? <img src={userGroup.avatar_url} className="w-full h-full object-cover" /> : <User size={24} className="m-auto text-zinc-700" />}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300 truncate w-16 text-center">{userGroup.username}</span>
                <span className="text-[6px] font-bold uppercase tracking-tighter text-zinc-500">{userGroup.role}</span>
              </div>
            </button>
          );
        })}

        {selectedIndex !== null && (
          <StoryViewer 
            allStories={combinedStories} 
            initialUserIndex={selectedIndex} 
            onClose={() => setSelectedIndex(null)} 
            currentUserId={currentUser?.id || null}
          />
        )}
      </div>

      <MusicSelector 
        isOpen={isMusicSelectorOpen}
        onClose={() => handleUploadWithMusic()} 
        onSelect={(music) => handleUploadWithMusic(music)} 
      />

      {/* ... (AlertDialog invariato) */}
    </>
  );
};

export default Stories;