"use client";

import React, { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";
import StoryViewer from './StoryViewer';
import { AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useAuth } from '@/hooks/use-auth';

const Stories = () => {
  const { user } = useAuth();
  const [userStory, setUserStory] = useState<{img: string, hasContent: boolean}>({
    img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LowDistrict',
    hasContent: false
  });
  const [showViewer, setShowViewer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizza l'avatar della storia con l'utente loggato
  useEffect(() => {
    if (user?.avatar) {
      setUserStory(prev => ({ ...prev, img: user.avatar || prev.img }));
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showError("Seleziona un'immagine");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUserStory({ img: event.target?.result as string, hasContent: true });
      showSuccess("Storia caricata!");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative z-10">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      <div className="flex gap-4 overflow-x-auto pt-2 pb-3 px-4 no-scrollbar bg-black border-b border-white/5">
        <button 
          onClick={() => userStory.hasContent ? setShowViewer(true) : fileInputRef.current?.click()}
          className="flex flex-col items-center gap-1.5 shrink-0 outline-none group relative"
        >
          <div className={cn(
            "w-[62px] h-[62px] rounded-full p-[2px] transition-all duration-300 group-active:scale-90",
            userStory.hasContent ? "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]" : "bg-zinc-800"
          )}>
            <div className="w-full h-full rounded-full border-2 border-black overflow-hidden relative bg-zinc-900">
              <img src={userStory.img} alt="La tua storia" className="w-full h-full object-cover" />
            </div>
          </div>
          {!userStory.hasContent && (
            <div className="absolute bottom-5 right-0 bg-red-600 text-white rounded-full p-0.5 border-[2px] border-black">
              <Plus size={12} strokeWidth={4} />
            </div>
          )}
          <span className="text-[10px] text-white/60 font-black uppercase tracking-tighter">La tua storia</span>
        </button>
      </div>

      <AnimatePresence>
        {showViewer && (
          <StoryViewer 
            stories={[{ id: 1, name: user?.display_name || 'Tu', img: userStory.img }]} 
            initialIndex={0} 
            onClose={() => setShowViewer(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Stories;