"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface StoryViewerProps {
  userStories: any;
  onClose: () => void;
}

const StoryViewer = ({ userStories, onClose }: StoryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const currentStory = userStories.items[currentIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < userStories.items.length - 1) {
            setCurrentIndex(currentIndex + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 1;
      });
    }, 50); // 5 secondi per storia (100 * 50ms)

    return () => clearInterval(timer);
  }, [currentIndex, userStories.items.length, onClose]);

  const next = () => {
    if (currentIndex < userStories.items.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
    >
      <div className="relative w-full max-w-lg h-full md:h-[90vh] bg-zinc-900 overflow-hidden md:rounded-3xl">
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
          {userStories.items.map((_: any, i: number) => (
            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ 
                  width: i === currentIndex ? `${progress}%` : i < currentIndex ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden">
              <img src={userStories.avatar_url} className="w-full h-full object-cover" alt="" />
            </div>
            <span className="text-xs font-black uppercase italic tracking-widest">{userStories.username}</span>
          </div>
          <button onClick={onClose} className="p-2 textthink
The user wants me to continue the previous response exactly where it left off.

Looking at the previous response:
The last part was:
```tsx
          <button onClick={onClose} className="p-2 text
```

I need to complete the `StoryViewer.tsx` file and then update `Stories.tsx`.

Plan:
1. Complete `src/components/StoryViewer.tsx`.
2. Update `src/components/Stories.tsx` to use the new hook and viewer, including the animated ring for the user's story.

Let's finish `StoryViewer.tsx` first.
The line was: `<button onClick={onClose} className="p-2 text`
It should probably be: `-white/50 hover:text-white transition-colors"><X size={24} /></button>`

Then I need to write `src/components/Stories.tsx`.

Wait, I should check if I need to add any dependencies. I'm using `framer-motion` which is already in `package.json`.

Let's write the files.-white/50 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Navigation Areas */}
        <div className="absolute inset-0 z-10 flex">
          <div className="w-1/3 h-full cursor-pointer" onClick={prev} />
          <div className="w-2/3 h-full cursor-pointer" onClick={next} />
        </div>

        {/* Image */}
        <img 
          src={currentStory.image_url} 
          className="w-full h-full object-cover" 
          alt="Story" 
        />

        {/* Desktop Controls */}
        <button 
          onClick={prev}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-black/20 hover:bg-black/40 rounded-full z-20"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={next}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-black/20 hover:bg-black/40 rounded-full z-20"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </motion.div>
  );
};

export default StoryViewer;