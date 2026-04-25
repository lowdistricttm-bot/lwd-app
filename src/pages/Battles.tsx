"use client";

import React from 'react';
import { useBattles } from '@/hooks/use-battles';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Swords, X, Trophy, Flame, Zap, User } from 'lucide-react';
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
      {/* Header con tasto chiusura - Posizionato sopra tutto */}
      <div className="absolute top-0 left-0 right-0 z-[110] p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pt-[calc(1.5rem+env(safe-area-inset-top))]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center shadow-xl rotate-12">
            <Swords size={20} className="-rotate-12" />
          </div>
          <div>
            <h2 className="text-lg font-black italic uppercase tracking-tighter leading-none">Stance Battle</h2>
            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mt-1">Vota la tua preferita</p>
          </div>
        </div>
        
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white hover:text-black transition-all shadow-2xl"
        >
          <X size={24} />
        </button>
      </div>

      {/* Arena di Battaglia - Occupa tutto lo spazio */}
      <div className="flex-1 relative flex flex-col md:flex-row">
        
        {/* CAR A */}
        <div 
          className="relative flex-1 group cursor-pointer overflow-hidden"
          onClick={() => !userVote && castVote(battle.car_a_id)}
        >
          <motion.img 
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: userVote && userVote !== battle.car_a_id ? 0.3 : 1 }}
            src={battle.car_a.image_url} 
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-1000",
              userVote && userVote !== battle.car_a_id ? "grayscale" : "grayscale-0",
              !userVote && "group-hover:scale-110"
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
          
          <div className="absolute bottom-12 left-8 right-8 md:bottom-20 md:left-12 z-10">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
              <div className="mb-2">
                <p className="text-[10px] font-black uppercase italic text-white tracking-widest">@{battle.car_a.profiles?.username}</p>
              </div>
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
                {battle.car_a.brand} <br />
                <span className="text-white/50">{battle.car_a.model}</span>
              </h2>
              
              {userVote && (
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-black italic">{getPercentage(stats.a)}%</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">{stats.a} VOTI</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${getPercentage(stats.a)}%` }} 
                      className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* VS BADGE CENTRALE - iOS Style */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <motion.div 
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.8 }}
            className="relative"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/20">
              <span className="text-xl md:text-2xl font-black italic tracking-tighter text-white leading-none">VS</span>
            </div>
            {/* Glow sottile esterno */}
            <div className="absolute inset-0 bg-white/5 blur-xl rounded-full -z-10" />
          </motion.div>
        </div>

        {/* CAR B */}
        <div 
          className="relative flex-1 group cursor-pointer overflow-hidden border-t md:border-t-0 md:border-l border-white/5"
          onClick={() => !userVote && castVote(battle.car_b_id)}
        >
          <motion.img 
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: userVote && userVote !== battle.car_b_id ? 0.3 : 1 }}
            transition={{ delay: 0.2 }}
            src={battle.car_b.image_url} 
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-1000",
              userVote && userVote !== battle.car_b_id ? "grayscale" : "grayscale-0",
              !userVote && "group-hover:scale-110"
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-transparent opacity-80 md:bg-gradient-to-t" />
          
          <div className="absolute top-12 left-8 right-8 md:top-auto md:bottom-20 md:right-12 z-10 text-right">
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
              <div className="mb-2">
                <p className="text-[10px] font-black uppercase italic text-white tracking-widest">@{battle.car_b.profiles?.username}</p>
              </div>
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
                {battle.car_b.brand} <br />
                <span className="text-white/50">{battle.car_b.model}</span>
              </h2>
              
              {userVote && (
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-end flex-row-reverse">
                    <span className="text-2xl font-black italic">{getPercentage(stats.b)}%</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">{stats.b} VOTI</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${getPercentage(stats.b)}%` }} 
                      className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] ml-auto" 
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-black border-t border-white/10 p-8 flex flex-col sm:flex-row justify-between items-center gap-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 border border-yellow-500/20">
            <Zap size={20} fill="currentColor" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest italic text-white">Guadagna Reputazione</p>
            <p className="text-[8px] font-bold uppercase text-zinc-500">Ogni voto ti assegna +1 punto REP</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-xl font-black italic leading-none">{stats.total}</p>
            <p className="text-[7px] font-black uppercase tracking-widest text-zinc-600 mt-1">Voti Totali</p>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-xl font-black italic leading-none text-orange-500">LIVE</p>
            <p className="text-[7px] font-black uppercase tracking-widest text-zinc-600 mt-1">Status Arena</p>
          </div>
        </div>
      </div>

      {/* Overlay Voto Effettuato */}
      <AnimatePresence>
        {userVote && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 z-[1200] pointer-events-none"
          >
            <div className="bg-white text-black px-8 py-3 rounded-full shadow-2xl flex items-center gap-3">
              <Trophy size={18} />
              <span className="text-[10px] font-black uppercase italic tracking-widest">Voto Registrato! +1 REP</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Battles;