"use client";

import React from 'react';
import { useTrophies } from '@/hooks/use-trophies';
import TrophyBadge from './TrophyBadge';
import { motion } from 'framer-motion';
import { Trophy as TrophyIcon, Star } from 'lucide-react';

const TrophySection = ({ userId }: { userId: string }) => {
  const { userTrophies, isLoading } = useTrophies(userId);

  if (isLoading || !userTrophies || userTrophies.length === 0) return null;

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

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
        {/* Background decorativo */}
        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
          <Star size={120} className="text-yellow-500" />
        </div>

        <div className="flex flex-wrap gap-8 justify-center md:justify-start relative z-10">
          {userTrophies.map((ut) => (
            <div key={ut.id} className="flex flex-col items-center gap-2">
              <TrophyBadge trophy={ut.trophies} size="md" showDetails={true} />
              {ut.vehicles && (
                <span className="text-[7px] font-black uppercase bg-white/10 px-2 py-0.5 rounded-full text-zinc-400 italic">
                  {ut.vehicles.brand} {ut.vehicles.model}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrophySection;