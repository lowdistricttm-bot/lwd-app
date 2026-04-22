"use client";

import React from 'react';
import { Trophy, Star, Award, ShieldCheck, Zap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export type TrophyType = 'best_fitment' | 'best_static' | 'best_air' | 'best_of_show' | 'top_10' | 'staff_pick';

interface TrophyBadgeProps {
  type: TrophyType | string;
  eventName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TrophyBadge = ({ type, eventName, size = 'md', className }: TrophyBadgeProps) => {
  const config = {
    best_of_show: { 
      icon: Crown, 
      label: 'Best of Show', 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-500/20', 
      border: 'border-yellow-500/50',
      glow: 'shadow-[0_0_20px_rgba(234,179,8,0.4)]'
    },
    best_fitment: { 
      icon: Zap, 
      label: 'Best Fitment', 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/20', 
      border: 'border-blue-500/50',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]'
    },
    best_static: { 
      icon: Award, 
      label: 'Best Static', 
      color: 'text-red-500', 
      bg: 'bg-red-500/20', 
      border: 'border-red-500/50',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]'
    },
    best_air: { 
      icon: Award, 
      label: 'Best Air', 
      color: 'text-cyan-400', 
      bg: 'bg-cyan-500/20', 
      border: 'border-cyan-500/50',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.4)]'
    },
    top_10: { 
      icon: Star, 
      label: 'Top 10 Selection', 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/20', 
      border: 'border-emerald-500/50',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]'
    },
    staff_pick: { 
      icon: ShieldCheck, 
      label: 'Staff Pick', 
      color: 'text-purple-400', 
      bg: 'bg-purple-500/20', 
      border: 'border-purple-500/50',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]'
    }
  }[type as TrophyType] || {
    icon: Trophy,
    label: type.replace('_', ' ').toUpperCase(),
    color: 'text-white',
    bg: 'bg-white/10',
    border: 'border-white/20',
    glow: 'shadow-xl'
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 gap-1",
    md: "px-3 py-1.5 gap-2",
    lg: "px-5 py-3 gap-3"
  };

  const textClasses = {
    sm: "text-[7px]",
    md: "text-[9px]",
    lg: "text-[11px]"
  };

  const iconSizes = {
    sm: 10,
    md: 14,
    lg: 20
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -2 }}
      className={cn(
        "inline-flex items-center rounded-xl border backdrop-blur-xl transition-all duration-500 cursor-default",
        config.bg,
        config.border,
        config.glow,
        sizeClasses[size],
        className
      )}
      title={`${config.label} - ${eventName}`}
    >
      <Icon size={iconSizes[size]} className={cn(config.color, "drop-shadow-md")} fill="currentColor" fillOpacity={0.2} />
      <div className="flex flex-col leading-none">
        <span className={cn("font-black uppercase italic tracking-widest", config.color, textClasses[size])}>
          {config.label}
        </span>
        <span className={cn("font-bold uppercase opacity-40 mt-0.5", textClasses.sm)} style={{ fontSize: size === 'lg' ? '8px' : '6px' }}>
          {eventName}
        </span>
      </div>
    </motion.div>
  );
};

export default TrophyBadge;