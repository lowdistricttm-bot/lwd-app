import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { motion } from 'framer-motion';
import { Trophy, Crown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DailyWinner = () => {
  const [winner, setWinner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLastWinner = async () => {
      // Recupera l'ultima battaglia finita
      const { data: battle } = await supabase
        .from('stance_battles')
        .select(`
          *,
          winner:vehicles!winner_id(
            *,
            profiles:profiles(username, avatar_url)
          )
        `)
        .eq('status', 'finished')
        .order('ends_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (battle && battle.winner) {
        setWinner(battle.winner);
      }
      setLoading(false);
    };

    fetchLastWinner();
  }, []);

  if (loading || !winner) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(`/profile/${winner.user_id}`)}
      className="relative w-full h-48 md:h-64 rounded-[2.5rem] overflow-hidden cursor-pointer group mb-8 border border-white/10 shadow-2xl"
    >
      {/* Immagine Auto Vincitrice */}
      <img 
        src={winner.image_url} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
        alt="Winner"
      />
      
      {/* Overlay Gradiente */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      
      {/* Badge "Champion" */}
      <div className="absolute top-6 left-6 bg-yellow-500 text-black px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl">
        <Crown size={14} />
        <span className="text-[10px] font-black uppercase italic tracking-widest">Daily Champion</span>
      </div>

      {/* Info Vincitore */}
      <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-black uppercase italic text-yellow-500 mb-1 tracking-[0.2em]">Vincitore di Ieri</p>
          <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none text-white">
            {winner.brand} <span className="text-white/50">{winner.model}</span>
          </h2>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20">
              <img src={winner.profiles?.avatar_url} className="w-full h-full object-cover" alt="" />
            </div>
            <span className="text-[10px] font-black uppercase italic text-zinc-300">@{winner.profiles?.username}</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
          <span className="text-[10px] font-black uppercase italic">Vedi Profilo</span>
          <ChevronRight size={14} />
        </div>
      </div>
    </motion.div>
  );
};

export default DailyWinner;