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
      "flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border shadow-xl w-fit transition-all duration-500",
      isGold 
        ? "bg-yellow-500 text-black border-yellow-300 shadow-yellow-500/20" 
        : "bg-zinc-200 text-black border-white shadow-white/10",
      className
    )}>
      <Icon size={12} strokeWidth={3} />
      <span className="text-[8px] font-black uppercase italic tracking-widest whitespace-nowrap">
        {trophy.title} • {trophy.event_name}
      </span>
    </div>
  );
};

export default TrophyBar;