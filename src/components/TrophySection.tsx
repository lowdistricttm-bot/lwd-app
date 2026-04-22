"use client";

import React from 'react';
import { useTrophies } from '@/hooks/use-trophies';
import { useAdmin } from '@/hooks/use-admin';
import TrophyBadge from './TrophyBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy as TrophyIcon, Star, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const TrophySection = ({ userId }: { userId: string }) => {
  const { userTrophies, isLoading, revokeTrophy } = useTrophies(userId);
  const { canManage } = useAdmin();

  if (isLoading || !userTrophies || userTrophies.length === 0) return null;

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Sei sicuro di voler revocare questo premio? L'azione è immediata.")) {
      revokeTrophy.mutate(id);
    }
  };

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="w-8 h-8 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 border border-yellow-500/20">
          <TrophyIcon size={16} />
        </div>
        <div>
          <h3 className="text-lg font-black italic uppercase tracking-tighter leading-none">Hall of Fame</h3>
          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Premi ufficiali Low District</p>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 relative overflow-hidden shadow-2xl">
        {/* Background decorativo */}
        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
          <Star size={100} className="text-yellow-500" />
        </div>

        <div className="flex flex-wrap gap-6 justify-center md:justify-start relative z-10">
          <AnimatePresence mode="popLayout">
            {userTrophies.map((ut) => (
              <motion.div 
                key={ut.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="relative group/item"
              >
                <TrophyBadge trophy={ut.trophies} size="xs" showDetails={true} />
                
                {ut.vehicles && (
                  <div className="mt-1 text-center">
                    <span className="text-[6px] font-black uppercase bg-white/10 px-1.5 py-0.5 rounded-full text-zinc-500 italic">
                      {ut.vehicles.brand}
                    </span>
                  </div>
                )}

                {/* Tasto Revoca per Admin */}
                {canManage && (
                  <button 
                    onClick={(e) => handleDelete(e, ut.id)}
                    disabled={revokeTrophy.isPending}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover/item:opacity-100 transition-all hover:scale-110 active:scale-90 z-20"
                  >
                    {revokeTrophy.isPending ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TrophySection;