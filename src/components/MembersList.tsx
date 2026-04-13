"use client";

import React from 'react';
import { Users, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useBpMembers } from '@/hooks/use-buddypress';

const MembersList = () => {
  const { data: members, isLoading } = useBpMembers(15);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-red-600" />
          <h3 className="text-sm font-black uppercase tracking-widest italic">Membri Ufficiali</h3>
        </div>
        <Link to="/members" className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1">
          Vedi Tutti <ChevronRight size={12} />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 min-h-[100px]">
        {isLoading ? (
          <div className="flex items-center justify-center w-full py-4">
            <Loader2 className="animate-spin text-red-600" size={20} />
          </div>
        ) : (
          members?.map((member: any, i: number) => (
            <motion.div 
              key={member.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-2 shrink-0"
            >
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 p-1 overflow-hidden">
                <img 
                  src={member.avatar_urls?.thumb || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_login}`} 
                  alt={member.name}
                  className="w-full h-full object-cover rounded-xl grayscale"
                />
              </div>
              <span className="text-[9px] font-black uppercase text-gray-500 truncate w-16 text-center">
                {member.name.split(' ')[0]}
              </span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default MembersList;