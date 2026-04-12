"use client";

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import StoryViewer from './StoryViewer';
import { AnimatePresence } from 'framer-motion';

const stories = [
  { id: 1, name: 'Your Story', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400', isUser: true },
  { id: 2, name: 'M3_Static', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400' },
  { id: 3, name: 'Low_911', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400' },
  { id: 4, name: 'JDM_Vibes', img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=400' },
  { id: 5, name: 'Stance_IT', img: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=400' },
];

const Stories = () => {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  return (
    <>
      <div className="flex gap-4 overflow-x-auto py-6 px-6 no-scrollbar bg-black border-b border-white/5">
        {stories.map((story, index) => (
          <button 
            key={story.id} 
            onClick={() => setSelectedStoryIndex(index)}
            className="flex flex-col items-center gap-2 shrink-0 outline-none"
          >
            <div className={cn(
              "w-16 h-16 rounded-full p-[2px] transition-transform active:scale-90",
              story.isUser ? "bg-zinc-800" : "bg-gradient-to-tr from-red-600 to-orange-500"
            )}>
              <div className="w-full h-full rounded-full border-2 border-black overflow-hidden">
                <img src={story.img} alt={story.name} className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="text-[10px] font-bold text-gray-400 truncate w-16 text-center uppercase tracking-tighter">
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