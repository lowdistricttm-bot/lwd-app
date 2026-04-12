"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { useBpMembers } from '@/hooks/use-buddypress';
import { ChevronLeft, Loader2, Search, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const Members = () => {
  const navigate = useNavigate();
  const { data: members, isLoading } = useBpMembers(100); // Carichiamo i primi 100 membri

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      
      <div className="pt-24 px-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">Membri Community</h1>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Cerca un membro..." 
            className="w-full bg-zinc-900 border-none py-4 pl-12 pr-4 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-red-600 outline-none"
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Caricamento directory...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {members?.map((member: any, i: number) => (
              <motion.div 
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-4 bg-zinc-900/50 border border-white/5 rounded-2xl hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 border border-white/5">
                    <img 
                      src={member.avatar_urls?.thumb || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_login}`} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase italic leading-none mb-1">{member.name}</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">@{member.user_login}</p>
                  </div>
                </div>
                <button className="p-2 text-gray-500 hover:text-red-600 transition-colors">
                  <UserPlus size={20} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Members;