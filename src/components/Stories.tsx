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

  // Separiamo la mia storia da quelle degli altri
  const { myStory, otherStories } = useMemo(() => {
    if (!stories || !user) return { myStory: null, otherStories: stories || [] };
    
    const currentUserId = Number(user.id);
    const mine = stories.find((s: any) => Number(s.user_id) === currentUserId);
    const others = stories.filter((s: any) => Number(s.user_id) !== currentUserId);
    
    return { myStory: mine, otherStories: others };
  }, [stories, user]);

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
        userName: user.display_name,
        imageUrl: publicUrl 
      });
      
      showSuccess("Storia pubblicata!");
    } catch (err: any) {
      showError("Errore durante il caricamento.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openViewer = (storyId: string) => {
    if (!stories) return;
    const index = stories.findIndex((s: any) => s.id === storyId);
    setSelectedStoryIndex(index);
    setShowViewer(true);
  };

  if (isLoading) return <div className="h-24 flex items-center px-6"><Loader2 className="animate-spin text-red-600" /></div>;

  return (
    <div className="relative z-10">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      
      <div className="flex gap-4 overflow-x-auto pt-4 pb-6 px-6 no-scrollbar bg-black">
        {/* SLOT UTENTE (Sempre il primo) */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="relative">
            <button 
              onClick={() => myStory ? openViewer(myStory.id) : fileInputRef.current?.click()}
              className={cn(
                "w-[72px] h-[72px] rounded-full p-[3px] transition-all",
                myStory 
                  ? "bg-gradient-to-tr from-yellow-400 via-red-600 to-purple-600" 
                  : "bg-zinc-900 border border-white/10"
              )}
            >
              <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-zinc-900">
                <img 
                  src={user?.avatar || "https://www.lowdistrict.it/wp-content/uploads/placeholder.png"} 
                  className="w-full h-full object-cover" 
                  alt="La tua storia"
                />
              </div>
            </button>
            
            {/* Il tasto + è un overlay sul cerchio dell'utente */}
            {!myStory && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 border-2 border-black hover:scale-110 transition-transform z-20"
              >
                {isUploading ? (
                  <Loader2 className="animate-spin text-white" size={12} />
                ) : (
                  <Plus size={12} className="text-white" />
                )}
              </button>
            )}
          </div>
          <span className="text-[10px] font-black uppercase text-white/40">La tua storia</span>
        </div>

        {/* ALTRE STORIE (Solo altri utenti) */}
        {otherStories.map((story: any) => (
          <button 
            key={story.id} 
            onClick={() => openViewer(story.id)}
            className="flex flex-col items-center gap-2 shrink-0"
          >
            <div className="w-[72px] h-[72px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-red-600 to-purple-600">
              <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-zinc-900">
                <img src={story.image_url} className="w-full h-full object-cover" alt="" />
              </div>
            </div>
            <span className="text-[10px] text-white font-black uppercase truncate w-16 text-center">
              {story.user_name || 'Membro'}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showViewer && stories && (
          <StoryViewer 
            stories={stories.map((s: any) => ({ 
              id: s.id, 
              userId: String(s.user_id),
              name: s.user_name || 'Membro', 
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