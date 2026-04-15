"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Loader2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStories } from '@/hooks/use-stories';
import { supabase } from "@/integrations/supabase/client";
import StoryViewer from './StoryViewer';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { showError } from '@/utils/toast';

const Stories = () => {
  const navigate = useNavigate();
  const { stories, isLoading, uploadStory } = useStories();
  const [selectedUserStories, setSelectedUserStories] = useState<any>(null);
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!currentUser) {
      showError("Devi accedere per caricare una storia");
      navigate('/login');
      return;
    }

    await uploadStory.mutateAsync(files);
    e.target.value = '';
  };

  const handleStoryClick = (e: React.MouseEvent) => {
    if (!currentUser && !myStories) {
      e.preventDefault();
      showError("Accedi per partecipare al District");
      navigate('/login');
    }
  };

  const myStories = stories?.find(s => s.user_id === currentUser?.id);

  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar py-6 px-6 bg-black border-b border-white/5">
      {/* Upload / My Story Button */}
      <div className="flex flex-col items-center gap-2 shrink-0">
        <div className="relative">
          <label 
            onClick={handleStoryClick}
            className={cn(
              "relative block cursor-pointer group rounded-full p-[2.5px] transition-all duration-500",
              myStories ? "bg-gradient-to-tr from-zinc-700 via-zinc-400 to-white" : "bg-transparent"
            )}
          >
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              multiple
              onChange={handleUpload} 
              disabled={uploadStory.isPending} 
            />
            <div 
              onClick={(e) => {
                if (myStories) {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedUserStories(myStories);
                }
              }}
              className="w-16 h-16 rounded-full border-[2.5px] border-black flex items-center justify-center bg-zinc-900 group-hover:border-zinc-800 transition-all overflow-hidden"
            >
              {uploadStory.isPending ? (
                <Loader2 className="animate-spin text-zinc-400" size={20} />
              ) : myStories ? (
                <img src={myStories.items[0].image_url} className="w-full h-full object-cover" alt="My Story" />
              ) : userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <User size={24} className="text-zinc-700" />
              )}
            </div>
            
            {!myStories && (
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-black shadow-lg">
                <Plus size={12} className="text-black font-bold" />
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
          <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-zinc-700 via-zinc-400 to-white">
            <div className="w-full h-full rounded-full border-[2.5px] border-black overflow-hidden bg-zinc-900">
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