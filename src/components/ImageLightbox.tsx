"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdmin } from '@/hooks/use-admin';

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const ImageLightbox = ({ images, initialIndex, isOpen, onClose }: ImageLightboxProps) => {
  const { isAdmin } = useAdmin();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLoading(true);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLoading(true);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const src = images[currentIndex];
    if (!src) return;

    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `low-district-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(src, '_blank');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && images.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 touch-none"
        >
          {/* Header Controls */}
          <div className="absolute top-6 right-6 flex items-center gap-4 z-[310]">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mr-4">
              {currentIndex + 1} / {images.length}
            </span>
            {isAdmin && (
              <button
                onClick={handleDownload}
                className="p-3 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-all"
                title="Scarica Originale"
              >
                <Download size={20} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-3 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Buttons (Desktop) */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="hidden md:flex absolute left-6 p-4 bg-white/5 hover:bg-white text-white hover:text-black rounded-full transition-all z-[310]"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={handleNext}
                className="hidden md:flex absolute right-6 p-4 bg-white/5 hover:bg-white text-white hover:text-black rounded-full transition-all z-[310]"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          {/* Image Container with Swipe Support */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) handleNext();
              else if (info.offset.x > 50) handlePrev();
            }}think
The user wants me to continue the previous response which was cut off.
The previous response was updating `src/components/ImageLightbox.tsx`.
It stopped at:
```tsx
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) handleNext();
              else if (info.offset.x > 50) handlePrev();
            }}
```
I need to finish the `ImageLightbox.tsx` file and then update the other components (`FeedPost.tsx`, `Profile.tsx`, `GarageTab.tsx`, `AdminApplicationCard.tsx`) to use the new array-based props.

Wait, the previous response was a `<dyad-write>` block. If it was cut off, I should probably rewrite the whole file or at least the remaining part. But the instructions say "Continue exactly where you left off without any preamble".

However, I cannot just output text. I must use `<dyad-write>` tags.
The previous response had:
1. `<dyad-write path="src/components/ImageLightbox.tsx" ...>` (Cut off)
2. It was supposed to have updates for other files too.

Let's finish `ImageLightbox.tsx` first.

Actually, looking at the previous turn, the `<dyad-write>` tag for `ImageLightbox.tsx` was not closed.
I will provide the full content of `ImageLightbox.tsx` and then the other files.

Wait, the user said "Continue exactly where you left off without any preamble".
If I just start with the code, it might break the XML structure if I don't include the opening tag.
But the system instructions say "Only use ONE <dyad-write> block per file that you write!".

If the previous turn was cut off, the UI might be in a broken state.
I'll provide the full files that were intended to be sent.

Files to update:
1. `src/components/ImageLightbox.tsx` (Gallery support)
2. `src/components/FeedPost.tsx` (Pass array to Lightbox)
3. `src/pages/Profile.tsx` (Pass array to Lightbox)
4. `src/components/GarageTab.tsx` (Pass array to Lightbox)
5. `src/components/AdminApplicationCard.tsx` (Pass array to Lightbox)

Let's start.className="relative max-w-full max-h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin text-white/20" size={40} />
              </div>
            )}
            <img
              src={images[currentIndex]}
              alt={`Gallery item ${currentIndex + 1}`}
              onLoad={() => setLoading(false)}
              className="max-w-full max-h-[90vh] object-contain shadow-2xl pointer-events-none"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageLightbox;