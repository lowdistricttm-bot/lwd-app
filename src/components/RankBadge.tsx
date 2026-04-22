"use client";

import React from 'react';
import { Trophy, Medal, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankBadgeProps {
  rank: number;
  type: 'score' | 'likes';
  className?: string;
  showLabel?: boolean;
}

const RankBadge = ({ rank, type, className, showLabel = false }: RankBadgeProps) => {
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
      "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border backdrop-blur-md transition-all duration-500",
      config.bg,
      config.border,
      config.shadow,
      className
    )}>
      <Trophy size={12} className={cn(config.color, "drop-shadow-sm")} fill="currentColor" />
      {showLabel && (
        <span className={cn("text-[8px] font-black uppercase tracking-widest italic", config.color)}>
          {config.label} {type === 'score' ? 'LOW' : 'LIKE'}
        </span>
      )}
      {!showLabel && (
        <span className={cn("text-[9px] font-black italic", config.color)}>#{rank}</span>
      )}
    </div>
  );
};

export default RankBadge;