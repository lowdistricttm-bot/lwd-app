"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Heart, Share2, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { BPActivity } from '@/hooks/use-buddypress';

const ActivityItem = ({ activity }: { activity: BPActivity }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 border border-white/5 p-6 mb-4 hover:border-red-600/30 transition-all group"
    >
      <div className="flex gap-4 mb-4">
        <div className="w-12 h-12 bg-zinc-800 overflow-hidden border border-white/10 shrink-0">
          {activity.user_avatar?.thumb ? (
            <img src={activity.user_avatar.thumb} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">
              <User size={20} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-black italic tracking-tight truncate">
              {activity.user_name || 'Membro Low District'}
            </h4>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
              {formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: it })}
            </span>
          </div>
          <p className="text-[10px] text-red-600 font-black uppercase tracking-widest mt-0.5" 
             dangerouslySetInnerHTML={{ __html: activity.action }} />
        </div>
      </div>

      <div 
        className="text-zinc-300 text-sm leading-relaxed mb-6 prose prose-invert max-w-none
                   prose-p:mb-2 prose-a:text-red-600 prose-img:rounded-none"
        dangerouslySetInnerHTML={{ __html: activity.content.rendered }}
      />

      <div className="flex items-center gap-6 pt-4 border-t border-white/5">
        <button className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <Heart size={16} />
          <span className="text-[10px] font-black uppercase">Like</span>
        </button>
        <button className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <MessageSquare size={16} />
          <span className="text-[10px] font-black uppercase">Commenta</span>
        </button>
        <button className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors ml-auto">
          <Share2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default ActivityItem;