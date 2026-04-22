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
      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex items-center justify-center gap-3">
        <Loader2 size={18} className="animate-spin text-zinc-500" />
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Analisi Meteo Detailing...</span>
      </div>
    );
  }

  if (!weather) return null;

  const Icon = weather.canWash ? Sparkles : weather.currentCondition === 'Rainy' ? CloudRain : Cloud;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-[2.5rem] border p-6 transition-all duration-700 shadow-2xl",
        weather.canWash 
          ? "bg-white text-black border-white shadow-white/5" 
          : "bg-zinc-900/40 backdrop-blur-xl border-white/10 text-white"
      )}
    >
      {/* Background Decoration */}
      <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12">
        <Icon size={140} />
      </div>

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center shadow-lg",
              weather.canWash ? "bg-black text-white" : "bg-white/10 text-zinc-400"
            )}>
              <Icon size={16} />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] italic leading-none">Rain-Check</h4>
              <p className={cn(
                "text-[8px] font-bold uppercase tracking-widest mt-1",
                weather.canWash ? "text-black/60" : "text-zinc-500"
              )}>Meteo Detailing</p>
            </div>
          </div>
          
          <div className={cn(
            "px-3 py-1 rounded-full text-[8px] font-black uppercase italic flex items-center gap-1.5 border",
            weather.canWash 
              ? "bg-black/5 border-black/10 text-black" 
              : "bg-white/5 border-white/10 text-zinc-400"
          )}>
            <MapPin size={10} /> {weather.city}
          </div>
        </div>

        <div className="space-y-2">
          <p className={cn(
            "text-sm font-black italic uppercase leading-tight tracking-tight",
            weather.canWash ? "text-black" : "text-white"
          )}>
            {weather.message}
          </p>
          
          {!weather.canWash && (
            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 w-fit px-2 py-1 rounded-md">
              <AlertTriangle size={10} />
              Consiglio: Rimanda il lavaggio
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RainCheck;