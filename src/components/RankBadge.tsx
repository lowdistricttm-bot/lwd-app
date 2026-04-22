"use client";

import React from 'react';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankBadgeProps {
  rank: number;
  type: 'score' | 'likes';
  className?: string;
  showLabel?: boolean;
}

const RankBadge = ({ rank, type, className }: RankBadgeProps) => {
  if (rank > 3 || rank < 1) return null;

  const config = {
    1: { 
      label: 'GOLD', 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-500/20', 
      border: 'border-yellow-500/50',
      shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]'
    },
    2: { 
      label: 'SILVER', 
      color: 'text-zinc-300', 
      bg: 'bg-zinc-400/20', 
      border: 'border-zinc-400/50',
      shadow: 'shadow-[0_0_15px_rgba(161,161,170,0.3)]'
    },
    3: { 
      label: 'BRONZE', 
      color: 'text-orange-500', 
      bg: 'bg-orange-600/20', 
      border: 'border-orange-600/50',
      shadow: 'shadow-[0_0_15px_rgba(234,88,12,0.3)]'
    }
  }[rank as 1 | 2 | 3];

  return (
    <div className={cn(
      "group flex items-center gap-0 hover:gap-2 px-2 py-1.5 rounded-full backdrop-blur-md border shadow-xl w-fit transition-all duration-500 ease-in-out overflow-hidden max-w-[32px] hover:max-w-[150px]",
      config.bg,
      config.border,
      config.shadow,
      className
    )}>
      <Trophy size={14} className={cn(config.color, "shrink-0 drop-shadow-sm")} fill="currentColor" />
      
      <span className={cn(
        "text-[8px] font-black uppercase tracking-widest italic whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        config.color
      )}>
        {config.label} {type === 'score' ? 'LOW' : 'LIKE'}
      </span>
    </div>
  );
};

export default RankBadge;