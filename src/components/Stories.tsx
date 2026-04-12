"use client";

import React, { useState, useRef } from 'react';
import { cn } from "@/lib/utils";
import StoryViewer from './StoryViewer';
import { AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useAuth } from '@/hooks/use-auth';

const Stories = () => {
  const { user } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [myStory, setMyStory] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultAvatar = "https://www.lowdistrict.it/wp-content/uploads/placeholder.png";
  const userAvatar = imgError || !user?.avatar ? defaultAvatar : user.avatar;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showError("Seleziona un'immagine");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setMyStory(result);
      showSuccess("Storia caricata!");
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarClick = () => {
    if (myStory) {
      setShowViewer(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="relative z-10">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      <div className="flex gap-4 overflow-x-auto pt-2 pb-3 px-4 no-scrollbar bg-black border-b border-white/5">
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <button 
            onClick={handleAvatarClick}
            className="flex flex-col items-center gap-1.5 outline-none group relative"
          >
            <div className={cn(
              "w-[66px] h-[66px] rounded-full p-[2.5px] transition-all duration-500 group-active:scale-90",
              myStory 
                ? "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]" 
                : "bg-zinc-800"
            )}>
              <div className="w-full h-full rounded-full border-2 border-black overflow-hidden relative bg-zinc-900">
                <img 
                  src={userAvatar} 
                  alt="La tua storia" 
                  className="w-full h-full object-cover" 
                  onError={() => setImgError(true)}
                />
              </div>
            </div>
            
            {!myStory && (
              <div className="absolute bottom-5 right-0 bg-red-600 text-white rounded-full p-0.5 border-[2px] border-black">
                <Plus size={12} strokeWidth={4} />
              </div>
            )}
            
            <span className={cn(
              "text-[10px] font-black uppercase tracking-tighter transition-colors",
              myStory ? "text-white" : "text-white/60"
            )}>
              {myStory ? "Tua Storia" : "Aggiungi"}
            </span>
          </button>
          
          {myStory && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-[8px] font-black text-red-600 uppercase tracking-widest mt-0.5"
            >
              Nuova
            </button>
          )}
        </div>

        {/* Esempio di altre storie (Mock) */}
        {[1, 2, 3].map((i) => (
          <button key={i} className="flex flex-col items-center gap-1.5 shrink-0 group">
            <div className="w-[66px] h-[66px] rounded-full p-[2.5px] bg-zinc-800 group-hover:bg-white/20 transition-all">
              <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-zinc-900">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User${i}`} alt="" className="w-full h-full object-cover grayscale" />
              </div>
            </div>
            <span className="text-[10px] text-white/40 font-black uppercase tracking-tighter">User_{i}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showViewer && myStory && (
          <StoryViewer 
            stories={[{ id: 1, name: user?.display_name || 'Tu', img: myStory }]} 
            initialIndex={0} 
            onClose={() => setShowViewer(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Stories;