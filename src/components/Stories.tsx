"use client";

import React, { useRef, useMemo } from 'react';
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
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Separiamo la mia storia dalle altre
  const { myStory, otherStories } = useMemo(() => {
    if (!stories) return { myStory: null, otherStories: [] };
    const mine = stories.find((s: any) => String(s.user_id) === String(user?.id));
    const others = stories.filter((s: any) => String(s.user_id) !== String(user?.id));
    return { myStory: mine, otherStories: others };
  }, [stories, user?.id]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!user || !file) return;

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

      await createStory.mutateAsync({ 
        userId: Number(user.id), 
        imageUrl: publicUrl 
      });
      
      showSuccess("Storia pubblicata!");
    } catch (err: any) {
      console.error("Storage error:", err);
      showError("Errore durante il caricamento della storia.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openViewer = (index: number, isMine: boolean = false) => {
    if (isMine) {
      // Trova l'indice reale nel set completo di storie
      const realIndex = stories.findIndex((s: any) => s.id === myStory.id);
      setSelectedStoryIndex(realIndex);
    } else {
      const realIndex = stories.findIndex((s: any) => s.id === otherStories[index].id);
      setSelectedStoryIndex(realIndex);
    }
    setShowViewer(true);
  };

  if (isLoading) return <div className="h-24 flex items-center px-6"><Loader2 className="animate-spin text-red-600" /></div>;

  return (
    <div className="relative z-10">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      
      <div className="flex gap-4 overflow-x-auto pt-4 pb-6 px-6 no-scrollbar bg-black">
        {/* Slot Personale (La mia storia o tasto aggiungi) */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="relative">
            <button 
              onClick={() => myStory ? openViewer(0, true) : fileInputRef.current?.click()}
              className={cn(
                "w-[72px] h-[72px] rounded-full p-[3px] transition-all",
                myStory 
                  ? "bg-gradient-to-tr from-yellow-400 via-red-600 to-purple-600" 
                  : "bg-zinc-900 border border-white/10"
              )}
            >
              <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-zinc-900">
                <img 
                  src={myStory ? myStory.image_url : (user?.avatar || "https://www.lowdistrict.it/wp-content/uploads/placeholder.png")} 
                  className={cn("w-full h-full object-cover", !myStory && "opacity-50")} 
                  alt="La mia storia"
                />
              </div>
            </button>
            
            {/* Tasto + in basso a destra */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              disabled={isUploading}
              className="absolute bottom-0 right-0 bg-red-600 rounded-full p-1 border-2 border-black hover:scale-110 transition-transform z-20"
            >
              {isUploading ? (
                <Loader2 className="animate-spin text-white" size={12} />
              ) : (
                <Plus size={12} className="text-white" />
              )}
            </button>
          </div>
          <span className="text-[10px] font-black uppercase text-white/40">La tua storia</span>
        </div>

        {/* Lista altre storie */}
        {otherStories.map((story: any, idx: number) => (
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
              User_{String(story.user_id).slice(0, 5)}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showViewer && stories && (
          <StoryViewer 
            stories={stories.map((s: any) => ({ 
              id: s.id, 
              name: `User_${String(s.user_id).slice(0, 5)}`, 
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