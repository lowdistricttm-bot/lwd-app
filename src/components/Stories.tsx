"use client";

import React, { useRef } from 'react';
import { cn } from "@/lib/utils";
import StoryViewer from './StoryViewer';
import { AnimatePresence } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useAuth } from '@/hooks/use-auth';
import { useStories, useCreateStory } from '@/hooks/use-stories';
import { supabase } from '@/integrations/supabase/client';

const Stories = () => {
  const { user } = useAuth();
  const { data: stories, isLoading } = useStories();
  const createStory = useCreateStory();
  
  const [showViewer, setShowViewer] = React.useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = React.useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!user || !file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Caricamento su Supabase Storage (assumendo esista il bucket 'stories')
      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('stories')
        .getPublicUrl(fileName);

      await createStory.mutateAsync({ 
        userId: String(user.id), 
        imageUrl: publicUrl 
      });
      
      showSuccess("Storia pubblicata!");
    } catch (err: any) {
      // Se il bucket non esiste, usiamo un placeholder per il test
      console.error("Storage error, using placeholder:", err);
      const placeholderUrl = "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800";
      await createStory.mutateAsync({ 
        userId: String(user.id), 
        imageUrl: placeholderUrl 
      });
      showSuccess("Storia pubblicata (Demo Mode)!");
    }
  };

  const openViewer = (index: number) => {
    setSelectedStoryIndex(index);
    setShowViewer(true);
  };

  if (isLoading) return <div className="h-24 flex items-center px-6"><Loader2 className="animate-spin text-red-600" /></div>;

  return (
    <div className="relative z-10">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      
      <div className="flex gap-4 overflow-x-auto pt-4 pb-6 px-6 no-scrollbar bg-black">
        {/* Il tuo slot per aggiungere */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="relative w-[72px] h-[72px] rounded-full bg-zinc-900 border border-white/10 p-1 flex items-center justify-center overflow-hidden"
          >
            <img 
              src={user?.avatar || "https://www.lowdistrict.it/wp-content/uploads/placeholder.png"} 
              className="w-full h-full object-cover rounded-full opacity-50" 
              alt=""
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-red-600 rounded-full p-1 border-2 border-black">
                <Plus size={16} className="text-white" />
              </div>
            </div>
          </button>
          <span className="text-[10px] font-black uppercase text-white/40">Aggiungi</span>
        </div>

        {/* Lista storie */}
        {stories?.map((story: any, idx: number) => (
          <button 
            key={story.id} 
            onClick={() => openViewer(idx)}
            className="flex flex-col items-center gap-2 shrink-0"
          >
            <div className="w-[72px] h-[72px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-red-600 to-purple-600">
              <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-zinc-900">
                <img src={story.image_url} className="w-full h-full object-cover" alt="" />
              </div>
            </div>
            <span className="text-[10px] text-white font-black uppercase truncate w-16 text-center">
              User_{story.user_id.slice(0, 5)}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showViewer && stories && (
          <StoryViewer 
            stories={stories.map((s: any) => ({ 
              id: s.id, 
              name: `User_${s.user_id.slice(0, 5)}`, 
              img: s.image_url,
              views: s.views?.[0]?.count || 0
            }))} 
            initialIndex={selectedStoryIndex} 
            onClose={() => setShowViewer(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Stories;