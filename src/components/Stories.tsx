"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Camera, Loader2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStories } from '@/hooks/use-stories';
import { supabase } from "@/integrations/supabase/client";
import StoryViewer from './StoryViewer';
import { cn } from '@/lib/utils';

const Stories = () => {
  const { stories, isLoading, uploadStory } = useStories();
  const [selectedUserStories, setSelectedUserStories] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle().then(({ data }) => {
          setUserProfile(data);
        });
      }
    });
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadStory.mutateAsync(file);
  };

  // Trova se l'utente corrente ha storie attive
  const myStories = stories?.find(s => s.user_id === currentUser?.id);

  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar py-6 px-6 bg-black border-b border-white/5">
      {/* Upload / My Story Button */}
      <div className="flex flex-col items-center gap-2 shrink-0">
        <div className="relative">
          <label className={cn(
            "relative block cursor-pointer group rounded-full p-[3px]",
            myStories ? "bg-gradient-to-tr from-red-600 to-white animate-spin-slow" : ""
          )}>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleUpload} 
              disabled={uploadStory.isPending} 
            />
            <div 
              onClick={(e) => {
                if (myStories) {
                  e.preventDefault();
                  setSelectedUserStories(myStories);
                }
              }}
              className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center bg-zinc-900 group-hover:border-red-600 transition-all overflow-hidden"
            >
              {uploadStory.isPending ? (
                <Loader2 className="animate-spin text-red-600" size={20} />
              ) : myStories ? (
                <img src={myStories.items[0].image_url} className="w-full h-full object-cover" alt="My Story" />
              ) : userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <User size={24} className="text-zinc-700" />
              )}
            </div>
            
            {!myStories && (
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center border-2 border-black">
                <Plus size={10} className="text-white" />
              </div>
            )}
          </label>
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">La tua storia</span>
      </div>

      {/* Other Stories */}
      {stories?.filter(s => s.user_id !== currentUser?.id).map((userGroup) => (
        <button 
          key={userGroup.user_id} 
          onClick={() => setSelectedUserStories(userGroup)}
          className="flex flex-col items-center gap-2 shrink-0 group"
        >
          <div className="w-16 h-16 rounded-full p-[3px] bg-gradient-to-tr from-red-600 to-white">
            <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-zinc-900">
              {userGroup.avatar_url ? (
                <img src={userGroup.avatar_url} alt={userGroup.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700"><User size={24} /></div>
              )}
            </div>
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300 truncate w-16 text-center">
            {userGroup.username}
          </span>
        </button>
      ))}

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {selectedUserStories && (
          <StoryViewer 
            userStories={selectedUserStories} 
            onClose={() => setSelectedUserStories(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Stories;