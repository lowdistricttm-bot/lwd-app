"use client";

import React, { useState, useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";
import StoryViewer from './StoryViewer';
import { AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const INITIAL_STORIES = [
  { 
    id: 1, 
    name: 'La tua storia', 
    img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LowDistrict', 
    isUser: true,
    hasContent: false
  },
  { id: 2, name: 'm3_static', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800' },
  { id: 3, name: 'low_911', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800' },
  { id: 4, name: 'jdm_vibes', img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800' },
  { id: 5, name: 'stance_it', img: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800' },
];

const Stories = () => {
  const [allStories, setAllStories] = useState(INITIAL_STORIES);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedStoryIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedStoryIndex]);

  const handleAddStoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError("Per favore seleziona un'immagine");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      
      // Aggiorna la storia dell'utente con la nuova immagine
      setAllStories(prev => prev.map(s => 
        s.isUser ? { ...s, img: imageUrl, hasContent: true } : s
      ));
      
      showSuccess("Storia caricata con successo!");
    };
    reader.readAsDataURL(file);
  };

  const handleStoryClick = (index: number) => {
    const story = allStories[index];
    // Se è l'utente e non ha ancora caricato nulla, apri il selettore
    if (story.isUser && !story.hasContent) {
      fileInputRef.current?.click();
    } else {
      setSelectedStoryIndex(index);
    }
  };

  return (
    <div className="relative z-10">
      {/* Input nascosto per fotocamera/galleria */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
      />

      <div className="flex gap-4 overflow-x-auto py-4 px-4 no-scrollbar bg-black border-b border-white/5">
        {allStories.map((story, index) => (
          <button 
            key={story.id} 
            onClick={() => handleStoryClick(index)}
            className="flex flex-col items-center gap-1.5 shrink-0 outline-none group relative"
          >
            <div className={cn(
              "w-[68px] h-[68px] rounded-full p-[2.5px] transition-all duration-300 group-active:scale-90",
              story.isUser && !story.hasContent
                ? "bg-transparent" 
                : "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]"
            )}>
              <div className="w-full h-full rounded-full border-2 border-black overflow-hidden relative bg-zinc-900">
                <img src={story.img} alt={story.name} className="w-full h-full object-cover" />
              </div>
            </div>

            {story.isUser && (
              <div 
                onClick={handleAddStoryClick}
                className="absolute bottom-6 right-0 bg-red-600 text-white rounded-full p-0.5 border-[2.5px] border-black hover:scale-110 transition-transform z-10"
              >
                <Plus size={14} strokeWidth={4} />
              </div>
            )}

            <span className="text-[11px] text-white/60 truncate w-16 text-center font-medium">
              {story.name}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedStoryIndex !== null && (
          <StoryViewer 
            stories={allStories} 
            initialIndex={selectedStoryIndex} 
            onClose={() => setSelectedStoryIndex(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Stories;