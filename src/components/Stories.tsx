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
  image_url: string;
  created_at: string;
}

const Stories = () => {
  const { user } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [myStory, setMyStory] = useState<StoryData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadStory = async () => {
      if (!user?.id) return;

      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      try {
        const { data, error } = await supabase
          .from('stories')
          .select('image_url, created_at')
          .eq('user_id', user.id)
          .gt('created_at', twentyFourHoursAgo)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          setMyStory(data);
        }
      } catch (err) {
        console.error("Errore caricamento storia:", err);
      }
    };

    loadStory();
  }, [user?.id]);

  const defaultAvatar = "https://www.lowdistrict.it/wp-content/uploads/placeholder.png";
  const userAvatar = imgError || !user?.avatar ? defaultAvatar : user.avatar;

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
          image_url: publicUrl,
          created_at: new Date().toISOString()
        }]);

      if (dbError) throw dbError;

      setMyStory({ image_url: publicUrl, created_at: new Date().toISOString() });
      showSuccess("Storia pubblicata!");
    } catch (err: any) {
      showError("Errore: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarClick = () => {
    if (myStory) {
      setShowViewer(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="relative z-10">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      <div className="flex gap-4 overflow-x-auto pt-2 pb-3 px-4 no-scrollbar bg-black border-b border-white/5">
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <button 
            onClick={handleAvatarClick}
            disabled={isUploading}
            className="flex flex-col items-center gap-1.5 outline-none group relative"
          >
            <div className={cn(
              "w-[66px] h-[66px] rounded-full p-[2.5px] transition-all duration-500 group-active:scale-90",
              myStory 
                ? "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]" 
                : "bg-zinc-800"
            )}>
              <div className="w-full h-full rounded-full border-2 border-black overflow-hidden relative bg-zinc-900 flex items-center justify-center">
                {isUploading ? (
                  <Loader2 className="animate-spin text-red-600" size={20} />
                ) : (
                  <img 
                    src={myStory ? myStory.image_url : userAvatar} 
                    alt="La tua storia" 
                    className="w-full h-full object-cover" 
                    onError={() => setImgError(true)}
                  />
                )}
              </div>
            </div>
            
            {!myStory && !isUploading && (
              <div className="absolute bottom-5 right-0 bg-red-600 text-white rounded-full p-0.5 border-[2px] border-black">
                <Plus size={12} strokeWidth={4} />
              </div>
            )}
            
            <span className={cn(
              "text-[10px] font-black uppercase tracking-tighter transition-colors",
              myStory ? "text-white" : "text-white/60"
            )}>
              {isUploading ? "Caricamento..." : myStory ? "Tua Storia" : "Aggiungi"}
            </span>
          </button>
        </div>

        {[1, 2, 3].map((i) => (
          <button key={i} className="flex flex-col items-center gap-1.5 shrink-0 group">
            <div className="w-[66px] h-[66px] rounded-full p-[2.5px] bg-zinc-800 group-hover:bg-white/20 transition-all">
              <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-zinc-900">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User${i}`} alt="" className="w-full h-full object-cover grayscale" />
              </div>
            </div>
            <span className="text-[10px] text-white/40 font-black uppercase tracking-tighter">User_{i}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showViewer && myStory && (
          <StoryViewer 
            stories={[{ id: 1, name: user?.display_name || 'Tu', img: myStory.image_url }]} 
            initialIndex={0} 
            onClose={() => setShowViewer(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Stories;