"use client";

import React, { useState, useEffect } from 'react';
import { useHighlights } from '@/hooks/use-highlights';
import { Loader2, Edit2, Trash2, X, Check } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { supabase } from "@/integrations/supabase/client";
import StoryViewer from './StoryViewer';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

interface HighlightsBarProps {
  userId: string;
  isOwnProfile: boolean;
}

const HighlightsBar = ({ userId, isOwnProfile }: HighlightsBarProps) => {
  const { highlights, isLoading, updateHighlightTitle, deleteHighlight } = useHighlights(userId);
  const [selectedHighlightIndex, setSelectedHighlightIndex] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  const handleStartEdit = (e: React.MouseEvent, h: any) => {
    e.stopPropagation();
    setEditingId(h.id);
    setNewTitle(h.title);
  };

  const handleSaveTitle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingId || !newTitle.trim()) return;
    await updateHighlightTitle.mutateAsync({ id: editingId, title: newTitle.toUpperCase() });
    setEditingId(null);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Vuoi eliminare definitivamente questa raccolta?")) {
      await deleteHighlight.mutateAsync(id);
    }
  };

  if (isLoading) return <div className="flex gap-6 py-4"><Loader2 className="animate-spin text-zinc-800" size={20} /></div>;
  if (!highlights?.length && !isOwnProfile) return null;

  const formattedHighlights = highlights?.map(h => ({
    user_id: h.user_id,
    highlight_id: h.id,
    username: h.title,
    avatar_url: h.cover_url,
    role: 'highlight',
    items: h.highlight_items?.map((item: any) => ({
      ...item.stories,
      highlight_item_id: item.id
    })).filter(Boolean) || []
  })).filter(h => h.items.length > 0) || [];

  return (
    <div className="mb-8 border-b border-white/5 pb-6">
      {(highlights?.length > 0 || isOwnProfile) && (
        <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] italic mb-4 ml-1">
          Storie in evidenza
        </h3>
      )}
      
      {/* Aggiunto padding superiore (pt-4) per far spazio ai pulsanti admin */}
      <div className="flex gap-6 overflow-x-auto no-scrollbar pt-4 pb-2 px-1">
        {highlights?.map((h, idx) => (
          <div key={h.id} className="flex flex-col items-center gap-2 shrink-0 group relative">
            <div className="relative">
              {/* Main trigger area */}
              <div 
                onClick={() => setSelectedHighlightIndex(idx)}
                className="w-16 h-16 rounded-full p-[2px] border border-white/10 group-hover:border-white transition-all duration-500 cursor-pointer"
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900">
                  <img src={h.cover_url} className="w-full h-full object-cover" alt={h.title} />
                </div>
              </div>
              
              {/* Admin actions - Posizionamento migliorato per evitare clipping */}
              {isOwnProfile && !editingId && (
                <div className="absolute -top-3 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 scale-90 group-hover:scale-100">
                  <button 
                    onClick={(e) => handleStartEdit(e, h)}
                    className="w-7 h-7 bg-white text-black rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:bg-zinc-200 transition-colors"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, h.id)}
                    className="w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>

            {editingId === h.id ? (
              <div className="flex items-center gap-1 animate-in fade-in zoom-in-95">
                <Input 
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="h-6 w-20 bg-white/10 border-white/20 text-[8px] font-black uppercase p-1 text-center rounded-md"
                />
                <button onClick={handleSaveTitle} className="text-green-500"><Check size={12} /></button>
                <button onClick={() => setEditingId(null)} className="text-zinc-500"><X size={12} /></button>
              </div>
            ) : (
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors truncate w-16 text-center">
                {h.title}
              </span>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedHighlightIndex !== null && (
          <StoryViewer 
            allStories={formattedHighlights}
            initialUserIndex={selectedHighlightIndex}
            onClose={() => setSelectedHighlightIndex(null)}
            currentUserId={currentUserId}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HighlightsBar;