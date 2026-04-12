"use client";

import React from 'react';
import { Users, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const MembersList = () => {
  // Per ora usiamo dei membri fittizi o potremmo estrarli dai post di Supabase in futuro
  const members = [
    { id: 1, name: "StanceMaster", login: "stancemaster" },
    { id: 2, name: "LowLife", login: "lowlife" },
    { id: 3, name: "StaticKing", login: "staticking" },
    { id: 4, name: "AirRide_IT", login: "airride_it" },
  ];

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-red-600" />
          <h3 className="text-sm font-black uppercase tracking-widest italic">Membri App</h3>
        </div>
        <Link to="/members" className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1">
          Vedi Tutti <ChevronRight size={12} />
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar px-4">
        {members.map((member, i) => (
          <motion.div 
            key={member.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col items-center gap-2 shrink-0"
          >
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 p-1 overflow-hidden">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.login}`} 
                alt={member.name}
                className="w-full h-full object-cover rounded-xl grayscale"
              />
            </div>
            <span className="text-[9px] font-black uppercase text-gray-500 truncate w-16 text-center">
              {member.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MembersList;