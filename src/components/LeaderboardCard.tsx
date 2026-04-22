"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Heart, Sparkles, ChevronRight, User, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardCardProps {
  vehicle: any;
  rank: number;
  type: 'score' | 'likes';
  onSelect: (vehicle: any) => void;
}

const LeaderboardCard = ({ vehicle, rank, type, onSelect }: LeaderboardCardProps) => {
  
  const getRankStyles = (r: number) => {
    switch(r) {
      case 1: return { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-500", icon: "text-yellow-500" };
      case 2: return { bg: "bg-zinc-400/10", border: "border-zinc-400/30", text: "text-zinc-400", icon: "text-zinc-400" };
      case 3: return { bg: "bg-orange-600/10", border: "border-orange-600/30", text: "text-orange-600", icon: "text-orange-600" };
      default: return { bg: "bg-white/5", border: "border-white/5", text: "text-zinc-500", icon: "text-zinc-700" };
    }
  };

  const styles = getRankStyles(rank);
  const mainImage = vehicle.images?.[0] || vehicle.image_url;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      onClick={() => onSelect(vehicle)}
      className={cn(
        "relative flex items-center gap-4 p-4 rounded-[2rem] border transition-all duration-500 group cursor-pointer",
        styles.bg,
        styles.border,
        "hover:bg-white/10"
      )}
    >
      <div className="w-8 shrink-0 flex flex-col items-center">
        {rank <= 3 ? (
          <Trophy size={20} className={styles.icon} />
        ) : (
          <span className="text-lg font-black italic text-zinc-800">#{rank}</span>
        )}
      </div>

      <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shrink-0 bg-zinc-950">
        {mainImage ? (
          <img src={mainImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-800"><User size={24} /></div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-black italic uppercase truncate text-white">
            {vehicle.brand} {vehicle.model}
          </h4>
        </div>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full overflow-hidden border border-white/10">
              {vehicle.profiles?.avatar_url ? (
                <img src={vehicle.profiles.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800"><User size={10} /></div>
              )}
            </div>
            <span className="text-[9px] font-black uppercase italic text-zinc-500">@{vehicle.profiles?.username}</span>
            {vehicle.profiles?.is_admin && <ShieldCheck size={10} className="text-white" />}
          </div>
        </div>

        <div className="flex gap-3">
          {type === 'score' ? (
            <div className="flex items-center gap-1.5 bg-white text-black px-2.5 py-1 rounded-lg shadow-lg">
              <Sparkles size={10} />
              <span className="text-[10px] font-black italic">LOW SCORE: {vehicle.stance_score}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-red-500 text-white px-2.5 py-1 rounded-lg shadow-lg">
              <Heart size={10} fill="currentColor" />
              <span className="text-[10px] font-black italic">{vehicle.likes_count} LIKES</span>
            </div>
          )}
        </div>
      </div>

      <ChevronRight size={20} className="text-zinc-800 group-hover:text-white transition-colors" />
    </motion.div>
  );
};

export default LeaderboardCard;