"use client";

import React from 'react';
import { useWeather } from '@/hooks/use-weather';
import { CloudRain, Sun, Cloud, Sparkles, AlertTriangle, Loader2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const RainCheck = ({ city }: { city?: string }) => {
  const { data: weather, isLoading } = useWeather(city);

  if (!city) return null;

  if (isLoading) {
    return (
      <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-4 text-center min-h-[200px]">
        <Loader2 size={32} className="animate-spin text-zinc-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Analisi Meteo Detailing...</p>
      </div>
    );
  }

  if (!weather) return null;

  const Icon = weather.canWash ? Sparkles : weather.currentCondition === 'Rainy' ? CloudRain : Cloud;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-900/80 backdrop-blur-xl text-white shadow-2xl"
    >
      {/* Background Decoration */}
      <div className="absolute -right-8 -bottom-8 opacity-[0.03] rotate-12 pointer-events-none">
        <Icon size={180} />
      </div>

      <div className="relative z-10 p-8 md:p-10 flex flex-col gap-8">
        {/* Header Area - Perfezionata */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-2xl bg-white/5 border border-white/10",
              weather.canWash ? "text-yellow-400" : "text-zinc-400"
            )}>
              <Icon size={20} />
            </div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] italic leading-none">Rain-Check</h4>
          </div>
          
          <div className="px-4 py-2 rounded-full text-[9px] font-black uppercase italic flex items-center gap-2 border border-white/5 bg-black/40 text-zinc-300 shadow-inner shrink-0">
            <MapPin size={12} className="text-zinc-500" /> {weather.city}
          </div>
        </div>

        {/* Message Content */}
        <div className="space-y-6">
          <p className="text-lg md:text-xl font-black italic uppercase leading-tight tracking-tight text-white/90">
            {weather.message}
          </p>
          
          <div className="flex flex-wrap gap-3">
            {!weather.canWash && (
              <div className="flex items-center gap-2.5 text-[9px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-xl">
                <AlertTriangle size={14} />
                Consiglio: Rimanda il lavaggio
              </div>
            )}

            {weather.canWash && (
              <div className="flex items-center gap-2.5 text-[9px] font-black uppercase tracking-widest text-green-400 bg-green-400/10 border border-green-400/20 px-4 py-2 rounded-xl">
                <Sparkles size={14} />
                Meteo Perfetto
              </div>
            )}

            <div className="flex items-center gap-2.5 text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
              <Cloud size={14} />
              {weather.currentCondition === 'Clear' ? 'Cielo Limpido' : weather.currentCondition === 'Rainy' ? 'Pioggia' : 'Nuvoloso'}
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="pt-6 border-t border-white/5">
          <p className="text-[8px] font-bold uppercase text-zinc-600 tracking-widest leading-relaxed">
            Dati aggiornati in tempo reale per garantirti la miglior resa del detailing sul tuo progetto.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default RainCheck;