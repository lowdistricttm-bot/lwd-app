"use client";

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import StoryViewer from './StoryViewer';
import { AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const stories = [
  { 
    id: 1, 
    name: 'La tua storia', 
    img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LowDistrict', 
    isUser: true 
  },
  { id: 2, name: 'm3_static', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800' },
  { id: 3, name: 'low_911', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800' },
  { id: 4, name: 'jdm_vibes', img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800' },
  { id: 5, name: 'stance_it', img: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800' },
];

const Stories = () => {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  const handleAddStory = (e: React.MouseEvent) => {
    e.stopPropagation();
    showSuccess("Apertura fotocamera per nuova storia...");
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto py-4 px-4 no-scrollbar bg-black border-b border-white/5">
        {stories.map((story, index) => (
          <button 
            key={story.id} 
            onClick={() => setSelectedStoryIndex(index)}
            className="flex flex-col items-center gap-1.5 shrink-0 outline-none group relative"
          >
            <div className={cn(
              "w-[68px] h-[68px] rounded-full p-[2.5px] transition-all duration-300 group-active:scale-90",
              story.isUser 
                ? "bg-transparent" 
                : "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]"
            )}>
              <div className="w-full h-full rounded-full border-2 border-black overflow-hidden relative bg-zinc-900">
                <img src={story.img} alt={story.name} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Instagram Style Plus Badge with Gray Background */}
            {story.isUser && (
              <div 
                onClick={handleAddStory}
                className="absolute bottom-6 right-0 bg-zinc-700 text-white rounded-full p-0.5 border-[2.5px] border-black hover:scale-110 transition-transform z-10"
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
think
The previous response was cut off after the `<dyad-write>` block for `src/components/Stories.tsx`. I need to provide the remaining part of the response, which includes the update to `src/pages/Index.tsx` to ensure the stories are not covered by the navbar on mobile, and the final summary.

Looking at the previous context:
- `src/components/Stories.tsx` was updated.
- I need to update `src/pages/Index.tsx` to add a spacer for mobile.
- I need to add the `<dyad-chat-summary>` and the concise summary sentence.

Wait, looking at `src/pages/Index.tsx` in the initial codebase:
```tsx
const Index = () => {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white pb-20 md:pb-0">
      <Navbar />
      
      {/* Mobile Header Spacer */}
      <div className="h-16 md:hidden"></div>
      
      <Stories />
      ...
```
It already has a spacer. However, the user said "non si visualizzano ancora" (they are still not displayed). Maybe the spacer is too small or the `Navbar` height is different.

Let's check `src/components/Navbar.tsx`:
```tsx
<nav className={cn(
  "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-6",
  isScrolled ? "bg-black/95 backdrop-blur-xl border-b border-white/5 py-4" : "bg-transparent"
)}>
```
The `py-6` on a fixed nav makes it quite tall. `py-6` is 24px top + 24px bottom = 48px + content height.
The spacer in `Index.tsx` is `h-16` (64px).

If the user says they don't see them, maybe the `z-index` or the `fixed` nature of the navbar is overlapping.
Actually, the user said "non si visualizzano ancora e non riesco a caricarne una non si vede nemmeno il +".

I will update `src/pages/Index.tsx` to ensure the layout is robust and the stories are clearly visible. I'll also make sure the `Navbar` doesn't overlap.

Wait, the previous turn was interrupted. I should just finish the response.

The previous turn ended with:
`