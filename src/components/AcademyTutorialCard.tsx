"use client";

import React from 'react';
import { Tutorial, ACADEMY_CATEGORIES } from '@/hooks/use-academy';
import { BookOpen, ChevronRight, User, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AcademyTutorialCardProps {
  tutorial: Tutorial;
  onClick: () => void;
}

const AcademyTutorialCard = ({ tutorial, onClick }: AcademyTutorialCardProps) => {
  const categoryLabel = ACADEMY_CATEGORIES.find(c => c.id === tutorial.category)?.label || tutorial.category;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden group hover:border-white/20 transition-all duration-500 cursor-pointer shadow-xl"
    >
      <div className="aspect-video relative overflow-hidden bg-zinc-900">
        {tutorial.image_url ? (
          <img 
            src={tutorial.image_url} 
            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" 
            alt="" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-800">
            <BookOpen size={48} />
          </div>
        )}
        
        <div className="absolute top-4 left-4">
          <span className="bg-white text-black text-[8px] font-black uppercase px-2 py-1 italic rounded-lg shadow-lg">
            {categoryLabel}
          </span>
        </div>

        {tutorial.video_url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <PlayCircle size={32} />
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <h4 className="text-lg font-black italic uppercase tracking-tight text-white group-hover:text-zinc-300 transition-colors line-clamp-2 mb-4">
          {tutorial.title}
        </h4>
        
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-800 border border-white/10">
              {tutorial.profiles?.avatar_url ? (
                <img src={tutorial.profiles.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <User size={12} className="m-auto h-full text-zinc-600" />
              )}
            </div>
            <span className="text-[8px] font-black uppercase italic text-zinc-500">@{tutorial.profiles?.username}</span>
          </div>
          <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-white transition-colors">
            Leggi <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AcademyTutorialCard;