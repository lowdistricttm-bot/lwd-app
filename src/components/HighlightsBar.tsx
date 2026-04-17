"use client";

import React, { useState } from 'react';
import { useHighlights } from '@/hooks/use-highlights';
import { Loader2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StoryViewer from './StoryViewer';

interface HighlightsBarProps {
  userId: string;
  isOwnProfile: boolean;
}

const HighlightsBar = ({ userId, isOwnProfile }: HighlightsBarProps) => {
  const { highlights, isLoading } = useHighlights(userId);
  const [selectedHighlightIndex, setSelectedHighlightIndex] = useState<number | null>(null);

  if (isLoading) return <div className="flex gap-6 py-4"><Loader2 className="animate-spin text-zinc-800" size={20} /></div>;
  if (!highlights?.length && !isOwnProfile) return null;

  // Trasformiamo gli highlights nel formato accettato da StoryViewer
  const formattedHighlights = highlights?.map(h => ({
    user_id: h.user_id,
    username: h.title, // Usiamo il titolo della raccolta come nome
    avatar_url: h.cover_url,
    role: 'highlight',
    items: h.highlight_items?.map((item: any) => item.stories).filter(Boolean) || []
  })).filter(h => h.items.length > 0) || [];

  return (
    <div className="flex gap-6 overflow-x-auto no-scrollbar py-6 mb-8 border-b border-white/5">
      {highlights?.map((h, idx) => (
        <button 
          key={h.id} 
          onClick={() => setSelectedHighlightIndex(idx)}
          className="flex flex-col items-center gap-2 shrink-0 group"
        >
          <div className="w-16 h-16 rounded-full p-[2px] border border-white/10 group-hover:border-white transition-all duration-500">
            <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900">
              <img src={h.cover_url} className="w-full h-full object-cover" alt={h.title} />
            </div>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors truncate w-16 text-center">
            {h.title}
          </span>
        </button>
      ))}

      <AnimatePresence>
        {selectedHighlightIndex !== null && (
          <StoryViewer 
            allStories={formattedHighlights}
            initialUserIndex={selectedHighlightIndex}
            onClose={() => setSelectedHighlightIndex(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HighlightsBar;