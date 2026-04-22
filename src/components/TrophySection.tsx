"use client";

import React from 'react';
import { useTrophies } from '@/hooks/use-trophies';
import { useAdmin } from '@/hooks/use-admin';
import TrophyBadge from './TrophyBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy as TrophyIcon, Trash2, Loader2 } from 'lucide-react';
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
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="w-8 h-8 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 border border-yellow-500/20">
          <TrophyIcon size={16} />
        </div>
        <div>
          <h3 className="text-lg font-black italic uppercase tracking-tighter leading-none">Hall of Fame</h3>
          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Premi ufficiali Low District</p>
        </div>
      </div>

      {/* Lista scorrevole orizzontale */}
      <div className="flex gap-8 overflow-x-auto no-scrollbar px-2 py-2">
        <AnimatePresence mode="popLayout">
          {userTrophies.map((ut) => (
            <motion.div 
              key={ut.id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="relative group/item shrink-0"
            >
              <TrophyBadge trophy={ut.trophies} size="xs" showDetails={true} />
              
              {ut.vehicles && (
                <div className="mt-1 text-center">
                  <span className="text-[6px] font-black uppercase bg-white/5 border border-white/5 px-1.5 py-0.5 rounded-full text-zinc-500 italic">
                    {ut.vehicles.brand}
                  </span>
                </div>
              )}

              {/* Tasto Revoca per Admin */}
              {canManage && (
                <button 
                  onClick={(e) => handleDelete(e, ut.id)}
                  disabled={revokeTrophy.isPending}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover/item:opacity-100 transition-all hover:scale-110 active:scale-90 z-20"
                >
                  {revokeTrophy.isPending ? <Loader2 size={8} className="animate-spin" /> : <Trash2 size={10} />}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TrophySection;