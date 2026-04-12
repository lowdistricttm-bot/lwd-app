"use client";

import React from 'react';
import { useBpMembers } from '@/hooks/use-buddypress';
import { Loader2, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const MembersList = () => {
  const { data: members, isLoading } = useBpMembers();

  if (isLoading) return (
    <div className="flex justify-center py-8">
      <Loader2 className="animate-spin text-red-600" size={24} />
    </div>
  );

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-red-600" />
          <h3 className="text-sm font-black uppercase tracking-widest italic">Membri Ufficiali</h3>
        </div>
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
          {members?.length || 0} Attivi
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-2">
        {members?.map((member: any, i: number) => (
          <motion.div 
            key={member.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col items-center gap-2 shrink-0 group"
          >
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 p-1 group-hover:border-red-600/50 transition-all overflow-hidden">
              <img 
                src={member.avatar_urls?.thumb || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_login}`} 
                alt={member.name}
                className="w-full h-full object-cover rounded-xl grayscale group-hover:grayscale-0 transition-all"
              />
            </div>
            <span className="text-[9px] font-black uppercase tracking-tighter text-gray-500 group-hover:text-white transition-colors max-w-[64px] truncate text-center">
              {member.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MembersList;