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
    const files = Array.from(e.target.files || []);
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
      <div className="flex gap-4 overflow-x-auto no-scrollbar py-6 px-6 bg-transparent border-b border-white/5">
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
                  "w-16 h-16 rounded-full border-[2.5px] flex items-center justify-center bg-zinc-900 overflow-hidden transition-all",
                  myStoriesGroup ? "border-white" : "border-zinc-800"
                )}
              >
                {uploadStory.isPending ? (
                  <Loader2 className="animate-spin text-zinc-400" size={20} />
                ) : (myStoriesGroup?.avatar_url || userProfile?.avatar_url) ? (
                  <img src={myStoriesGroup?.avatar_url || userProfile?.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <User size={24} className="text-zinc-700" />
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
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">La tua storia</span>
          </div>
        )}

        {otherStories.map((userGroup: any, index: number) => (
          <button key={userGroup.user_id} onClick={() => handleStoryClick(index)} className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-zinc-700 via-zinc-400 to-white">
              <div className="w-full h-full rounded-full border-[2.5px] border-black overflow-hidden bg-zinc-900">
                {userGroup.avatar_url ? <img src={userGroup.avatar_url} className="w-full h-full object-cover" /> : <User size={24} className="m-auto text-zinc-700" />}
              </div>
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300 truncate w-16 text-center">{userGroup.username}</span>
          </button>
        ))}

        {selectedUserIndex !== null && (
          <StoryViewer allStories={otherStories} initialUserIndex={selectedUserIndex} onClose={() => setSelectedUserIndex(null)} />
        )}

        {isViewingSelf && myStoriesGroup && (
          <StoryViewer allStories={[myStoriesGroup]} initialUserIndex={0} onClose={() => setIsViewingSelf(false)} />
        )}
      </div>

      {/* Modal Invito Accesso per Storie */}
      <AlertDialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-none">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-zinc-900 border border-white/10 flex items-center justify-center rotate-45">
                <ShieldCheck size={32} className="text-white -rotate-45" />
              </div>
            </div>
            <AlertDialogTitle className="text-white font-black uppercase italic text-center">Entra nel District</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 text-xs font-bold uppercase leading-relaxed text-center">
              Per visualizzare le storie e i contenuti esclusivi della community Low District, devi far parte del club.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
            <AlertDialogAction 
              onClick={() => navigate('/login')} 
              className="rounded-none bg-white text-black font-black uppercase italic text-[10px] w-full h-12"
            >
              Accedi Ora <ArrowRight size={14} className="ml-2" />
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-none border-white/10 text-white font-black uppercase italic text-[10px] w-full h-12 mt-0">
              Chiudi
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Stories;