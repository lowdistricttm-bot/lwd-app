"use client";

import React from 'react';
import { useBattles } from '@/hooks/use-battles';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Swords, X, Trophy, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Battles = () => {
  const navigate = useNavigate();
  const { battle, loading, userVote, stats, castVote } = useBattles();

  if (loading) return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[1000]">
      <Loader2 className="animate-spin text-white mb-4" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Caricamento Arena...</p>
    </div>
  );

  if (!battle) return (
    <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center p-6 text-center z-[1000]">
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-[calc(1.5rem+env(safe-area-inset-top))] right-6 p-3 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-all"
      >
        <X size={24} />
      </button>
      <Swords size={64} className="mb-6 text-zinc-900" />
      <h1 className="text-2xl font-black italic uppercase tracking-tighter">Nessuna Battaglia Attiva</h1>
      <p className="text-zinc-500 mt-2 uppercase text-[10px] font-bold tracking-widest">Torna più tardi per la prossima sfida nell'arena.</p>
    </div>
  );

  const getPercentage = (count: number) => {
    if (stats.total === 0) return 50;
    return Math.round((count / stats.total) * 100);
  };

  return (
    <div className="fixed inset-0 bg-black text-white z-[1000] flex flex-col overflow-hidden select-none">
      
      {/* Header - Ora fa parte del flusso flex per spingere giù le immagini */}
      <header className="shrink-0 p-6 flex justify-between items-center bg-black border-b border-white/5 pt-[calc(1.5rem+env(safe-area-inset-top))]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white text-black rounded-xl flex items-center justify-center shadow-xl rotate-12">
            <Swords size={18} className="-rotate-12" />
          </div>
          <div>
            <h2 className="text-base font-black italic uppercase tracking-tighter leading-none">Stance Battle</h2>
            <p className="text-[7px] font-black uppercase tracking-widest text-zinc-500 mt-1">Vota la tua preferita</p>
          </div>
        </div>
        
        <button 
          onClick={() => navigate(-1)}
          className="p-2.5 bg-white/5 border border-white/10 rounded-full text-zinc-400 hover:text-white transition-all"
        >
          <X size={20} />
        </button>
      </header>

      {/* Arena di Battaglia - Inizia sotto l'header */}
      <div className="flex-1 relative flex flex-col md:flex-row overflow-hidden">
        
        {/* CAR A */}
        <div 
          className="relative flex-1 group cursor-pointer overflow-hidden"
          onClick={() => !userVote && castVote(battle.car_a_id)}
        >
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: userVote && userVote !== battle.car_a_id ? 0.3 : 1 }}
            src={battle.car_a.image_url} 
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-1000",
              userVote && userVote !== battle.car_a_id ? "grayscale" : "grayscale-0",
              !userVote && "group-hover:scale-105"
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 z-10">
            <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <p className="text-[8px] font-black uppercase italic text-white/60 tracking-widest mb-1">@{battle.car_a.profiles?.username}</p>
              <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-none">
                {battle.car_a.brand} <span className="text-white/40">{battle.car_a.model}</span>
              </h2>
              
              {userVote && (
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-xl font-black italic">{getPercentage(stats.a)}%</span>
                    <span className="text-[7px] font-black uppercase tracking-widest text-zinc-500">{stats.a} VOTI</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${getPercentage(stats.a)}%` }} 
                      className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* VS BADGE CENTRALE */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-12 h-12 md:w-16 md:h-16 bg-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center shadow-2xl border border-white/20"
          >
            <span className="text-sm md:text-xl font-black italic tracking-tighter text-white">VS</span>
          </motion.div>
        </div>

        {/* CAR B */}
        <div 
          className="relative flex-1 group cursor-pointer overflow-hidden border-t md:border-t-0 md:border-l border-white/5"
          onClick={() => !userVote && castVote(battle.car_b_id)}
        >
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: userVote && userVote !== battle.car_b_id ? 0.3 : 1 }}
            transition={{ delay: 0.1 }}
            src={battle.car_b.image_url} 
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-1000",
              userVote && userVote !== battle.car_b_id ? "grayscale" : "grayscale-0",
              !userVote && "group-hover:scale-105"
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent md:bg-gradient-to-t" />
          
          <div className="absolute top-6 left-6 right-6 md:top-auto md:bottom-6 z-10 text-right">
            <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
              <p className="text-[8px] font-black uppercase italic text-white/60 tracking-widest mb-1">@{battle.car_b.profiles?.username}</p>
              <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-none">
                {battle.car_b.brand} <span className="text-white/40">{battle.car_b.model}</span>
              </h2>
              
              {userVote && (
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between items-end flex-row-reverse">
                    <span className="text-xl font-black italic">{getPercentage(stats.b)}%</span>
                    <span className="text-[7px] font-black uppercase tracking-widest text-zinc-500">{stats.b} VOTI</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${getPercentage(stats.b)}%` }} 
                      className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] ml-auto" 
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer Info - Più piccolo e compatto */}
      <footer className="shrink-0 bg-black border-t border-white/10 px-6 py-4 flex justify-between items-center pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center text-yellow-500 border border-yellow-500/20">
            <Zap size={16} fill="currentColor" />
          </div>
          <div className="hidden xs:block">
            <p className="text-[8px] font-black uppercase tracking-widest italic text-white">Vota e Guadagna</p>
            <p className="text-[7px] font-bold uppercase text-zinc-600">+1 REP per ogni voto</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-lg font-black italic leading-none">{stats.total}</p>
            <p className="text-[6px] font-black uppercase tracking-widest text-zinc-600 mt-1">Voti Totali</p>
          </div>
          <div className="w-[1px] h-6 bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            <p className="text-[8px] font-black uppercase tracking-widest text-orange-500">Arena Live</p>
          </div>
        </div>
      </footer>

      {/* Overlay Voto Effettuato */}
      <AnimatePresence>
        {userVote && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1200] pointer-events-none"
          >
            <div className="bg-white text-black px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 border border-white/20">
              <Trophy size={14} />
              <span className="text-[9px] font-black uppercase italic tracking-widest">Voto Registrato!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Battles;