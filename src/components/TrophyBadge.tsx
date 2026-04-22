"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Star, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrophyBadgeProps {
  trophy: any;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const TrophyBadge = ({ trophy, size = 'md', showDetails = false }: TrophyBadgeProps) => {
  const category = trophy.category || 'gold_trophy';
  
  const getStyle = () => {
    if (category.startsWith('gold')) return "from-yellow-200 via-yellow-500 to-yellow-700 border-yellow-300/50 text-black";
    if (category.startsWith('silver')) return "from-zinc-200 via-zinc-400 to-zinc-600 border-zinc-300/50 text-black";
    if (category.startsWith('bronze')) return "from-orange-300 via-orange-600 to-orange-800 border-orange-400/50 text-white";
    return "from-zinc-800 via-zinc-900 to-black border-white/10 text-white";
  };

  const getIcon = (s: number) => {
    if (category.includes('award')) return <Award size={s} strokeWidth={2.5} />;
    if (category.includes('star')) return <Star size={s} strokeWidth={2.5} />;
    if (category.includes('shield')) return <ShieldCheck size={s} strokeWidth={2.5} />;
    if (category.includes('zap')) return <Zap size={s} strokeWidth={2.5} />;
    return <Trophy size={s} strokeWidth={2.5} />;
  };

  const sizes = {
    xs: "w-12 h-12",
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-32 h-32"
  };

  const iconSizes = {
    xs: 14,
    sm: 20,
    md: 28,
    lg: 48
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.1, rotateY: 15 }}
      className="flex flex-col items-center gap-2 group"
    >
      <div className={cn(
        "relative rounded-full flex items-center justify-center shadow-2xl transition-all duration-700 bg-gradient-to-br border-2",
        sizes[size],
        getStyle()
      )}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
        <motion.div 
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 blur-md pointer-events-none"
        />

        <div className="relative z-10 drop-shadow-lg">
          {getIcon(iconSizes[size])}
        </div>

        <div className="absolute -inset-1 border border-white/10 rounded-full pointer-events-none" />
      </div>

      {showDetails && (
        <div className="text-center max-w-[80px]">
          <p className="text-[8px] font-black uppercase italic tracking-tighter text-white leading-none mb-1 truncate">
            {trophy.title}
          </p>
          <p className="text-[6px] font-bold uppercase tracking-widest text-zinc-500 truncate">
            {trophy.event_name}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default TrophyBadge;