"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Star, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrophyBadgeProps {
  trophy: any;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const TrophyBadge = ({ trophy, size = 'md', showDetails = false }: TrophyBadgeProps) => {
  const isGold = trophy.category?.includes('best') || trophy.category === 'of_show';
  
  const sizes = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32"
  };

  const iconSizes = {
    sm: 16,
    md: 28,
    lg: 48
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.05, rotateY: 10 }}
      className="flex flex-col items-center gap-3 group"
    >
      <div className={cn(
        "relative rounded-full flex items-center justify-center shadow-2xl transition-all duration-700",
        sizes[size],
        isGold 
          ? "bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-700 border-2 border-yellow-300/50" 
          : "bg-gradient-to-br from-zinc-300 via-zinc-500 to-zinc-700 border-2 border-zinc-400/50"
      )}>
        {/* Effetto Lucentezza */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
        <motion.div 
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 blur-md pointer-events-none"
        />

        <div className="relative z-10 text-black drop-shadow-lg">
          {trophy.category === 'best_fitment' ? <Award size={iconSizes[size]} strokeWidth={2.5} /> :
           trophy.category === 'best_static' ? <ShieldCheck size={iconSizes[size]} strokeWidth={2.5} /> :
           <Trophy size={iconSizes[size]} strokeWidth={2.5} />}
        </div>

        {/* Incastonatura */}
        <div className="absolute -inset-1 border border-white/10 rounded-full pointer-events-none" />
      </div>

      {showDetails && (
        <div className="text-center">
          <p className="text-[10px] font-black uppercase italic tracking-tighter text-white leading-none mb-1">
            {trophy.title}
          </p>
          <p className="text-[7px] font-bold uppercase tracking-[0.3em] text-zinc-500">
            {trophy.event_name}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default TrophyBadge;