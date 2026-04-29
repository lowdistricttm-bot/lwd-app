"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useLeaderboards } from '@/hooks/use-leaderboards';
import { useGarage, Vehicle } from '@/hooks/use-garage';
import LeaderboardCard from '@/components/LeaderboardCard';
import VehicleDetailModal from '@/components/VehicleDetailModal';
import { 
  Trophy, Sparkles, Heart, Loader2, ChevronLeft, Users, ShieldCheck, User, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from "@/integrations/supabase/client";

const Leaderboards = () => {
  const navigate = useNavigate();
  const { topScored, mostLiked, topReputation, isLoading } = useLeaderboards();
  const { toggleLike } = useGarage();
  const [activeTab, setActiveTab] = useState<'score' | 'likes' | 'reputation'>('score');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  return (
    <div className="min-h-screen text-white flex flex-col bg-transparent">
      <Navbar />
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top)+2rem)] pb-32 px-6 max-w-7xl mx-auto w-full">
        <header className="mb-12">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 uppercase text-[10px] font-black tracking-widest transition-colors">
            <ChevronLeft size={16} /> Torna Indietro
          </button>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl rotate-12">
              <Trophy size={20} className="-rotate-12" />
            </div>
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] italic">District Hall of Fame</h2>
          </div>
          <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase">Classifiche</h1>
        </header>

        <div className="flex bg-zinc-900/50 backdrop-blur-md rounded-full p-1 mb-10 border border-white/5 max-w-4xl overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('score')} className={cn("flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-full transition-all duration-500 whitespace-nowrap", activeTab === 'score' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300")}>
            <Sparkles size={16} /> <span className="text-[10px] font-black uppercase tracking-widest italic">Score</span>
          </button>
          <button onClick={() => setActiveTab('likes')} className={cn("flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-full transition-all duration-500 whitespace-nowrap", activeTab === 'likes' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300")}>
            <Heart size={16} /> <span className="text-[10px] font-black uppercase tracking-widest italic">Like</span>
          </button>
          <button onClick={() => setActiveTab('reputation')} className={cn("flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-full transition-all duration-500 whitespace-nowrap", activeTab === 'reputation' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300")}>
            <Users size={16} /> <span className="text-[10px] font-black uppercase tracking-widest italic">Rep</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-zinc-500" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Calcolo posizioni...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {activeTab === 'reputation' ? (
                <motion.div key="rep-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {topReputation?.map((v: any, i) => (
                    <div key={v.id} onClick={() => navigate(`/profile/${v.profiles?.id}`)} className="bg-white/5 border border-white/5 p-5 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-black italic text-zinc-800 w-6">#{i+1}</span>
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 bg-black">
                          {v.profiles?.avatar_url ? (
                            <img src={v.profiles.avatar_url} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-800"><User size={24} /></div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black italic uppercase text-white">@{v.profiles?.username}</h4>
                            {v.profiles?.is_admin && <ShieldCheck size={12} className="text-white" />}
                          </div>
                          <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                            {v.brand} {v.model}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xl font-black italic text-yellow-500 leading-none">{v.profiles?.reputation || 0}</p>
                          <p className="text-[6px] font-black uppercase tracking-widest text-zinc-600 mt-1">Punti REP</p>
                        </div>
                        <ChevronRight size={20} className="text-zinc-800 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {(activeTab === 'score' ? topScored : mostLiked)?.map((v, i) => (
                    <LeaderboardCard key={v.id} vehicle={v} rank={i + 1} type={activeTab as 'score' | 'likes'} onSelect={(veh) => setSelectedVehicle(veh as Vehicle)} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedVehicle && (
          <VehicleDetailModal isOpen={!!selectedVehicle} onClose={() => setSelectedVehicle(null)} vehicle={selectedVehicle} isOwnProfile={currentUserId === selectedVehicle.user_id} onLike={(id) => toggleLike.mutate(id)} currentUserId={currentUserId} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Leaderboards;