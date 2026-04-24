import React from 'react';
import { useBattles } from '@/hooks/use-battles';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Swords, Trophy } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';

const Battles = () => {
  const { battle, loading, userVote, stats, castVote } = useBattles();

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-white" size={40} />
    </div>
  );

  if (!battle) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <Navbar />
      <Swords size={64} className="mb-6 text-zinc-800" />
      <h1 className="text-2xl font-black italic uppercase">Nessuna Battaglia Attiva</h1>
      <p className="text-zinc-500 mt-2 uppercase text-[10px] tracking-widest">Torna più tardi per la prossima sfida</p>
    </div>
  );

  const getPercentage = (count: number) => {
    if (stats.total === 0) return 50;
    return Math.round((count / stats.total) * 100);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden flex flex-col">
      <Navbar />
      
      <div className="flex-1 relative flex flex-col md:flex-row pt-20">
        {/* CAR A */}
        <div 
          className="relative flex-1 group cursor-pointer overflow-hidden"
          onClick={() => castVote(battle.car_a_id)}
        >
          <img 
            src={battle.car_a.image_url} 
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-700",
              userVote && userVote !== battle.car_a_id ? "grayscale opacity-30" : "grayscale-0 opacity-100",
              !userVote && "group-hover:scale-110"
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
          
          <div className="absolute bottom-10 left-10 right-10 z-10">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
              {battle.car_a.brand} <span className="text-zinc-400">{battle.car_a.model}</span>
            </h2>
            {userVote && (
              <motion.div initial={{ width: 0 }} animate={{ width: `${getPercentage(stats.a)}%` }} className="h-4 bg-white mt-4 rounded-full relative">
                <span className="absolute right-0 -top-6 font-black italic">{getPercentage(stats.a)}%</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* VS BADGE */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.3)] border-[8px] border-black">
            <span className="text-2xl font-black italic">VS</span>
          </div>
        </div>

        {/* CAR B */}
        <div 
          className="relative flex-1 group cursor-pointer overflow-hidden border-t md:border-t-0 md:border-l border-white/10"
          onClick={() => castVote(battle.car_b_id)}
        >
          <img 
            src={battle.car_b.image_url} 
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-700",
              userVote && userVote !== battle.car_b_id ? "grayscale opacity-30" : "grayscale-0 opacity-100",
              !userVote && "group-hover:scale-110"
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
          
          <div className="absolute bottom-10 left-10 right-10 z-10 text-right">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
              {battle.car_b.brand} <span className="text-zinc-400">{battle.car_b.model}</span>
            </h2>
            {userVote && (
              <motion.div initial={{ width: 0 }} animate={{ width: `${getPercentage(stats.b)}%` }} className="h-4 bg-white mt-4 rounded-full relative ml-auto">
                <span className="absolute left-0 -top-6 font-black italic">{getPercentage(stats.b)}%</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER INFO */}
      <div className="bg-black border-t border-white/10 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Trophy className="text-yellow-500" size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest italic">Vota per guadagnare Reputazione</span>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
          {stats.total} VOTI TOTALI
        </div>
      </div>
    </div>
  );
};

export default Battles;