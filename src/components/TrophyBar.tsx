"use client";

import React from 'react';
import { Trophy, Award, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrophyBarProps {
  trophy: any;
  className?: string;
}

const TrophyBar = ({ trophy, className }: TrophyBarProps) => {
  if (!trophy) return null;

  const isGold = trophy.category?.includes('best') || trophy.category === 'of_show';
  
  const Icon = trophy.category === 'best_fitment' ? Award :
               trophy.category === 'best_static' ? ShieldCheck :
               Trophy;

  return (
    <div className={cn(
      "group flex items-center gap-0 hover:gap-2 px-2 py-1.5 rounded-full backdrop-blur-md border shadow-xl w-fit transition-all duration-500 ease-in-out overflow-hidden max-w-[32px] hover:max-w-[300px]",
      isGold 
        ? "bg-yellow-500/90 border-yellow-300 shadow-yellow-500/20" 
        : "bg-zinc-200/90 border-white shadow-white/10",
      className
    )}>
      <Icon size={14} strokeWidth={3} className="text-black shrink-0" />
      
      <span className="text-[8px] font-black uppercase italic tracking-widest whitespace-nowrap text-black opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        {trophy.title} • {trophy.event_name}
      </span>
    </div>
  );
};

export default TrophyBar;