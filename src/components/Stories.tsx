"use client";

import React, { useState } from 'react';
import { Plus, Camera, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { showSuccess, showError } from '@/utils/toast';

const Stories = () => {
  const [isUploading, setIsUploading] = useState(false);

  // Mock stories data - in production this would come from WP Media API
  const stories = [
    { id: 1, user: 'LowDistrict', image: 'https://www.lowdistrict.it/wp-content/uploads/DSC01359-1-scaled-e1751832356345.jpg' },
    { id: 2, user: 'StanceLife', image: 'https://www.lowdistrict.it/wp-content/uploads/DSC01359-1-scaled-e1751832356345.jpg' },
    { id: 3, user: 'StaticDaily', image: 'https://www.lowdistrict.it/wp-content/uploads/DSC01359-1-scaled-e1751832356345.jpg' },
  ];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Here you would call your uploadStory function to WP
      // For now we simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      showSuccess("Storia caricata con successo!");
    } catch (error) {
      showError("Errore durante il caricamento.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar py-6 px-6 bg-black border-b border-white/5">
      {/* Upload Button */}
      <div className="flex flex-col items-center gap-2 shrink-0">
        <label className="relative cursor-pointer group">
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
          <div className="w-16 h-16 rounded-full border-2 border-zinc-800 flex items-center justify-center bg-zinc-900 group-hover:border-red-600 transition-all overflow-hidden">
            {isUploading ? (
              <Loader2 className="animate-spin text-red-600" size={20} />
            ) : (
              <Plus size={24} className="text-zinc-500 group-hover:text-white" />
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center border-2 border-black">
            <Camera size={10} className="text-white" />
          </div>
        </label>
        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">La tua storia</span>
      </div>

      {/* Story Items */}
      {stories.map((story) => (
        <div key={story.id} className="flex flex-col items-center gap-2 shrink-0">
          <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-red-600 to-white">
            <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-zinc-900">
              <img src={story.image} alt={story.user} className="w-full h-full object-cover" />
            </div>
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300 truncate w-16 text-center">
            {story.user}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Stories;