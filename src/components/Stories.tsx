"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Loader2, User, ShieldCheck, LogIn, ArrowRight } from 'lucide-react';
import { useStories } from '@/hooks/use-stories';
import { useAdmin } from '@/hooks/use-admin';
import { supabase } from "@/integrations/supabase/client";
import StoryViewer from './StoryViewer';
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
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);
  const [isViewingSelf, setIsViewingSelf] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        setUserProfile(data);
      }
    };
    checkUser();
  }, []);

  const isSubscriber = role === 'subscriber';
  const myStoriesGroup: any = (stories as any[])?.find((group: any) => group.user_id === currentUser?.id);
  const otherStories: any[] = (stories as any[])?.filter((group: any) => group.user_id !== currentUser?.id) || [];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    await uploadStory.mutateAsync({ files });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStoryClick = (index: number) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
    } else {
      setSelectedUserIndex(index);
    }
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto no-scrollbar py-5 px-6 bg-black/40 backdrop-blur-2xl border-b border-white/10 shadow-sm">
        {/* Sezione 'La tua storia' - Solo se l'utente è loggato */}
        {currentUser && (!isSubscriber || myStoriesGroup) && (
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" multiple onChange={handleFileSelect} />
              <button 
                onClick={() => {
                  if (myStoriesGroup) setIsViewingSelf(true);
                  else if (!isSubscriber) fileInputRef.current?.click();
                }}
                className={cn(
                  "w-[68px] h-[68px] rounded-full border-2 flex items-center justify-center bg-black/40 overflow-hidden transition-all backdrop-blur-md",
                  myStoriesGroup ? "border-white" : "border-white/20 border-dashed"
                )}
              >
                {uploadStory.isPending ? (
                  <Loader2 className="animate-spin text-white/50" size={24} />
                ) : (myStoriesGroup?.avatar_url || userProfile?.avatar_url) ? (
                  <img src={myStoriesGroup?.avatar_url || userProfile?.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black/20">
                    <User size={24} className="text-white/60" />
                  </div>
                )}
              </button>
              {!isSubscriber && (
                <button 
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="absolute bottom-0 right-0 w-[22px] h-[22px] bg-white rounded-full flex items-center justify-center border-2 border-black shadow-lg hover:scale-110 transition-transform"
                >
                  <Plus size={14} className="text-black font-black" />
                </button>
              )}
            </div>
            <span className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em] italic mt-0.5">La tua storia</span>
          </div>
        )}

        {otherStories.map((userGroup: any, index: number) => (
          <button key={userGroup.user_id} onClick={() => handleStoryClick(index)} className="flex flex-col items-center gap-2 shrink-0 group">
            <div className="w-[68px] h-[68px] rounded-full p-[2px] bg-gradient-to-tr from-zinc-500 via-zinc-300 to-white shadow-lg group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-black/40 backdrop-blur-md">
                {userGroup.avatar_url ? <img src={userGroup.avatar_url} className="w-full h-full object-cover" /> : <User size={24} className="m-auto h-full text-white/60" />}
              </div>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300 truncate w-[68px] text-center mt-0.5 group-hover:text-white transition-colors">{userGroup.username}</span>
          </button>
        ))}

        {selectedUserIndex !== null && (
          <StoryViewer allStories={otherStories} initialUserIndex={selectedUserIndex} onClose={() => setSelectedUserIndex(null)} />
        )}

        {isViewingSelf && myStoriesGroup && (
          <StoryViewer allStories={[myStoriesGroup]} initialUserIndex={0} onClose={() => setIsViewingSelf(false)} />
        )}
      </div>

      {/* Modal Invito Accesso per Storie - Stile iOS Glassmorphism */}
      <AlertDialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <AlertDialogContent className="bg-black/60 backdrop-blur-2xl border-white/10 rounded-[2rem] shadow-2xl">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center rounded-2xl rotate-12">
                <ShieldCheck size={32} className="text-white -rotate-12" />
              </div>
            </div>
            <AlertDialogTitle className="text-white font-black uppercase italic text-center">Entra nel District</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-xs font-bold uppercase leading-relaxed text-center">
              Per visualizzare le storie e i contenuti esclusivi della community Low District, devi far parte del club.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col mt-4">
            <AlertDialogAction 
              onClick={() => navigate('/login')} 
              className="rounded-full bg-white text-black hover:bg-zinc-200 font-black uppercase italic text-[10px] w-full h-14 transition-all shadow-xl"
            >
              Accedi Ora <ArrowRight size={16} className="ml-2" />
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-full border-white/10 text-white bg-transparent hover:bg-white/5 font-black uppercase italic text-[10px] w-full h-14 mt-0 transition-all focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
              Chiudi
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Stories;