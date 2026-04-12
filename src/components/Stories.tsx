"use client";

import React, { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";
import StoryViewer from './StoryViewer';
import { AnimatePresence } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

interface StoryData {
  id: string;
  user_id: number;
  image_url: string;
  created_at: string;
}

const Stories = () => {
  const { user } = useAuth();
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
    } catch (err: any) {
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
    if (!user || !file) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('stories').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('stories').getPublicUrl(fileName);
      const { error: dbError } = await supabase.from('stories').insert([{ user_id: user.id, image_url: publicUrl }]);
      if (dbError) throw dbError;
      showSuccess("Storia pubblicata!");
      await loadStories();
    } catch (err: any) {
      showError(err.message || "Errore durante il caricamento");
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
        <button onClick={() => myStory ? openViewer(allStories.indexOf(myStory)) : fileInputRef.current?.click()} className="flex flex-col items-center gap-1.5 shrink-0 relative">
          <div className={cn("w-[66px] h-[66px] rounded-full p-[2.5px]", myStory ? "bg-red-600" : "bg-zinc-800")}>
            <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-zinc-900 flex items-center justify-center">
              {isUploading ? <Loader2 className="animate-spin text-red-600" /> : <img src={myStory ? myStory.image_url : (user?.avatar || "https://www.lowdistrict.it/wp-content/uploads/placeholder.png")} className="w-full h-full object-cover" />}
            </div>
          </div>
          {!myStory && <div className="absolute bottom-5 right-0 bg-red-600 rounded-full p-0.5 border-2 border-black"><Plus size={12} /></div>}
          <span className="text-[10px] font-black uppercase text-white/60">{myStory ? "Tua Storia" : "Aggiungi"}</span>
        </button>

        {allStories.map((story, idx) => story.user_id !== user?.id && (
          <button key={story.id} onClick={() => openViewer(idx)} className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="w-[66px] h-[66px] rounded-full p-[2.5px] bg-red-600">
              <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-zinc-900">
                <img src={story.image_url} className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="text-[10px] text-white/40 font-black uppercase truncate w-16">User_{story.user_id}</span>
          </button>
        ))}
      </div>
      <AnimatePresence>
        {showViewer && <StoryViewer stories={allStories.map(s => ({ id: s.id, name: `User_${s.user_id}`, img: s.image_url }))} initialIndex={selectedStoryIndex} onClose={() => setShowViewer(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Stories;