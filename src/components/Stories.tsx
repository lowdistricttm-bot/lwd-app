"use client";

import React, { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";
import StoryViewer from './StoryViewer';
import { AnimatePresence } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

interface StoryData {
  id: string;
  user_id: number;
  image_url: string;
  created_at: string;
  display_name?: string; // Opzionale, se vogliamo mostrare il nome
}

const Stories = () => {
  const { user } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [allStories, setAllStories] = useState<StoryData[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadStories = async () => {
    setIsLoadingStories(true);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .gt('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllStories(data || []);
    } catch (err) {
      console.error("Errore caricamento storie:", err);
    } finally {
      setIsLoadingStories(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  const myStory = allStories.find(s => s.user_id === user?.id);
  const otherStories = allStories.filter(s => s.user_id !== user?.id);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('stories')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('stories')
        .insert([{ 
          user_id: user.id, 
          image_url: publicUrl
        }]);

      if (dbError) throw dbError;

      showSuccess("Storia pubblicata!");
      loadStories(); // Ricarica la lista
    } catch (err: any) {
      showError("Errore: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const openViewer = (index: number) => {
    setSelectedStoryIndex(index);
    setShowViewer(true);
  };

  return (
    <div className="relative z-10">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      <div className="flex gap-4 overflow-x-auto pt-2 pb-3 px-4 no-scrollbar bg-black border-b border-white/5">
        {/* Slot "La tua storia" */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <button 
            onClick={() => myStory ? openViewer(allStories.indexOf(myStory)) : fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex flex-col items-center gap-1.5 outline-none group relative"
          >
            <div className={cn(
              "w-[66px] h-[66px] rounded-full p-[2.5px] transition-all duration-500",
              myStory ? "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]" : "bg-zinc-800"
            )}>
              <div className="w-full h-full rounded-full border-2 border-black overflow-hidden relative bg-zinc-900 flex items-center justify-center">
                {isUploading ? (
                  <Loader2 className="animate-spin text-red-600" size={20} />
                ) : (
                  <img 
                    src={myStory ? myStory.image_url : (user?.avatar || "https://www.lowdistrict.it/wp-content/uploads/placeholder.png")} 
                    alt="Tu" 
                    className="w-full h-full object-cover" 
                  />
                )}
              </div>
            </div>
            {!myStory && !isUploading && (
              <div className="absolute bottom-5 right-0 bg-red-600 text-white rounded-full p-0.5 border-[2px] border-black">
                <Plus size={12} strokeWidth={4} />
              </div>
            )}
            <span className="text-[10px] font-black uppercase tracking-tighter text-white/60">
              {myStory ? "Tua Storia" : "Aggiungi"}
            </span>
          </button>
        </div>

        {/* Storie degli altri utenti */}
        {isLoadingStories ? (
          <div className="flex items-center px-4"><Loader2 className="animate-spin text-zinc-700" size={20} /></div>
        ) : (
          otherStories.map((story) => (
            <button 
              key={story.id} 
              onClick={() => openViewer(allStories.indexOf(story))}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
            >
              <div className="w-[66px] h-[66px] rounded-full p-[2.5px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]">
                <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-zinc-900">
                  <img src={story.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
              <span className="text-[10px] text-white/40 font-black uppercase tracking-tighter truncate w-16 text-center">
                User_{story.user_id}
              </span>
            </button>
          ))
        )}
      </div>

      <AnimatePresence>
        {showViewer && (
          <StoryViewer 
            stories={allStories.map(s => ({ id: parseInt(s.id), name: `User_${s.user_id}`, img: s.image_url }))} 
            initialIndex={selectedStoryIndex} 
            onClose={() => setShowViewer(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Stories;