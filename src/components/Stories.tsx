"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Loader2, User, ShieldCheck, LogIn, ArrowRight } from 'lucide-react';
import { useStories } from '@/hooks/use-stories';
import { useAdmin } from '@/hooks/use-admin';
import { useAuth } from '@/hooks/use-auth';
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
  const { user: currentUser } = useAuth();
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

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
      setSelectedIndex(index);
    }
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto no-scrollbar items-center h-[50px] px-6 bg-black border-b border-white/5">
        {currentUser && (!isSubscriber || myStoriesGroup) && (
          <div className="flex items-center shrink-0">
            <div className="relative">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" multiple onChange={handleFileSelect} />
              <button 
                onClick={() => {
                  if (myStoriesGroup) handleStoryClick(0);
                  else if (!isSubscriber) fileInputRef.current?.click();
                }}
                className={cn(
                  "w-8 h-8 rounded-full border-[1.5px] flex items-center justify-center bg-zinc-900 overflow-hidden transition-all",
                  myStoriesGroup ? "border-white" : "border-zinc-800"
                )}
              >
                {uploadStory.isPending ? (
                  <Loader2 className="animate-spin text-zinc-400" size={12} />
                ) : (myStoriesGroup?.avatar_url || userProfile?.avatar_url) ? (
                  <img src={myStoriesGroup?.avatar_url || userProfile?.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                    <User size={14} className="text-zinc-600" />
                  </div>
                )}
              </button>
              {!isSubscriber && !myStoriesGroup && (
                <button 
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center border border-black shadow-lg"
                >
                  <Plus size={10} className="text-black font-bold" />
                </button>
              )}
            </div>
          </div>
        )}

        {otherStories.map((userGroup: any, index: number) => {
          const actualIndex = myStoriesGroup ? index + 1 : index;
          return (
            <button key={userGroup.user_id} onClick={() => handleStoryClick(actualIndex)} className="flex items-center shrink-0">
              <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-zinc-700 via-zinc-400 to-white">
                <div className="w-full h-full rounded-full border border-black overflow-hidden bg-zinc-900">
                  {userGroup.avatar_url ? <img src={userGroup.avatar_url} className="w-full h-full object-cover" /> : <User size={14} className="m-auto text-zinc-700" />}
                </div>
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
              className="rounded-none bg-white text-black hover:bg-zinc-200 font-black uppercase italic text-[10px] w-full h-12 transition-all"
            >
              Accedi Ora <ArrowRight size={14} className="ml-2" />
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-none border-white/10 text-white hover:bg-white/5 font-black uppercase italic text-[10px] w-full h-12 mt-0 transition-all">
              Chiudi
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Stories;