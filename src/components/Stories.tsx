"use client";

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import StoryViewer from './StoryViewer';
import { AnimatePresence } from 'framer-motion';

const stories = [
  { id: 1, name: 'La tua storia', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800', isUser: true },
  { id: 2, name: 'm3_static', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800' },
  { id: 3, name: 'low_911', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800' },
  { id: 4, name: 'jdm_vibes', img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800' },
  { id: 5, name: 'stance_it', img: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800' },
];

const Stories = () => {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  return (
    <>
      <div className="flex gap-4 overflow-x-auto py-4 px-4 no-scrollbar bg-black border-b border-white/5">
        {stories.map((story, index) => (
          <button 
            key={story.id} 
            onClick={() => setSelectedStoryIndex(index)}
            className="flex flex-col items-center gap-1.5 shrink-0 outline-none group"
          >
            <div className={cn(
              "w-[68px] h-[68px] rounded-full p-[2.5px] transition-all duration-300 group-active:scale-90",
              story.isUser 
                ? "bg-zinc-800" 
                : "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]"
            )}>
              <div className="w-full h-full rounded-full border-2 border-black overflow-hidden">
                <img src={story.img} alt={story.name} className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="text-[11px] text-white/80 truncate w-16 text-center">
              {story.name}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedStoryIndex !== null && (
          <StoryViewer 
            stories={stories} 
            initialIndex={selectedStoryIndex} 
            onClose={() => setSelectedStoryIndex(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Stories;