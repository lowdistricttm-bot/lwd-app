"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { useBpMembers } from '@/hooks/use-buddypress';
import { ChevronLeft, Loader2, Search, UserPlus, RefreshCw, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const Members = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: members, isLoading, isFetching, refetch } = useBpMembers(50);

  const filteredMembers = members?.filter((m: any) => 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.user_login?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Navbar />
      
      <div className="pt-24 px-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">Membri Ufficiali</h1>
              <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Directory sincronizzata dal sito</p>
            </div>
          </div>
          <button 
            onClick={() => refetch()} 
            className={`p-3 bg-zinc-900 rounded-2xl transition-all ${isFetching ? 'animate-spin text-red-600' : 'text-gray-400'}`}
          >
            <RefreshCw size={20} />
          </button>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Cerca tra i membri..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member: any, i: number) => (
                <motion.div 
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 bg-zinc-900/50 border border-white/5 rounded-2xl hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-zinc-800 border border-white/5 p-0.5">
                      <img 
                        src={member.avatar_urls?.full || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_login}`} 
                        alt="" 
                        className="w-full h-full object-cover rounded-xl grayscale group-hover:grayscale-0 transition-all"
                      />
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase italic leading-none mb-1">{member.name}</h3>
                      <p className="text-[9px] text-red-600 font-black uppercase tracking-widest">@{member.user_login}</p>
                    </div>
                  </div>
                  <button className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-red-600 hover:bg-white/10 transition-all">
                    <UserPlus size={18} />
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl">
                <Users className="mx-auto text-gray-800 mb-4" size={40} />
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Nessun membro trovato</p>
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Members;