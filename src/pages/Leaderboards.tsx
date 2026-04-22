"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useLeaderboards } from '@/hooks/use-leaderboards';
import LeaderboardCard from '@/components/LeaderboardCard';
import { 
  Trophy, 
  Sparkles, 
  Heart, 
  Loader2, 
  ChevronLeft, 
  Info,
  Medal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const Leaderboards = () => {
  const navigate = useNavigate();
  const { topScored, mostLiked, isLoading } = useLeaderboards();
  const [activeTab, setActiveTab] = useState<'score' | 'likes'>('score');

  return (
    <div className="min-h-screen text-white flex flex-col bg-transparent">
      <Navbar />
      
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top)+2rem)] pb-32 px-6 max-w-4xl mx-auto w-full">
        <header className="mb-12">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 uppercase text-[10px] font-black tracking-widest transition-colors"
          >
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

        <div className="flex bg-zinc-900/50 backdrop-blur-md rounded-full p-1 mb-10 border border-white/5">
          <button 
            onClick={() => setActiveTab('score')}
            className={cn(
              "flex-1 flex items-center justify-center gap-3 py-4 px-4 rounded-full transition-all duration-500",
              activeTab === 'score' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Sparkles size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Top Stance</span>
          </button>
          <button 
            onClick={() => setActiveTab('likes')}
            className={cn(
              "flex-1 flex items-center justify-center gap-3 py-4 px-4 rounded-full transition-all duration-500",
              activeTab === 'likes' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Heart size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Community Choice</span>
          </button>
        </div>

        <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] flex items-start gap-4 mb-10">
          <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center shrink-0"><Info size={20} className="text-zinc-400" /></div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white italic">Come scalare la vetta</h4>
            <p className="text-[9px] text-zinc-500 font-bold uppercase leading-relaxed italic">
              {activeTab === 'score' 
                ? "Usa il Low Score Analyzer nel tuo Garage per ottenere un punteggio ufficiale basato sull'assetto e il fitment del tuo progetto."
                : "I like della community determinano la popolarità del tuo progetto. Carica foto di alta qualità per attirare l'attenzione del District."}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-zinc-500" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Calcolo posizioni...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {activeTab === 'score' ? (
                <motion.div 
                  key="score-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {topScored?.map((v, i) => (
                    <LeaderboardCard key={v.id} vehicle={v} rank={i + 1} type="score" />
                  ))}
                  {topScored?.length === 0 && (
                    <div className="text-center py-20 opacity-20">
                      <Medal size={48} className="mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Nessun punteggio registrato</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="likes-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {mostLiked?.map((v, i) => (
                    <LeaderboardCard key={v.id} vehicle={v} rank={i + 1} type="likes" />
                  ))}
                  {mostLiked?.length === 0 && (
                    <div className="text-center py-20 opacity-20">
                      <Heart size={48} className="mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Nessun apprezzamento ancora</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default Leaderboards;