"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Users, Radio, AlertTriangle, Info, Truck, Volume2, ShieldAlert } from 'lucide-react';
import { useCruising } from '@/hooks/use-cruising';
import { useBodyLock } from '@/hooks/use-body-lock';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";

interface CruisingModeProps {
  isOpen: boolean;
  onClose: () => void;
  carovanaId: string;
  carovanaTitle: string;
}

const CruisingMode = ({ isOpen, onClose, carovanaId, carovanaTitle }: CruisingModeProps) => {
  const [user, setUser] = useState<any>(null);
  const [carName, setCarName] = useState<string>('');
  const [lastAlert, setLastAlert] = useState<{ message: string, sender: string } | null>(null);

  const { 
    isActive, isSpeaking, units, activeCarovanaId,
    joinChannel, toggleMic, sendAlert 
  } = useCruising();

  useBodyLock(isOpen);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase.from('vehicles').select('brand, model').eq('user_id', user.id).eq('is_main', true).maybeSingle()
          .then(({ data }) => {
            if (data) setCarName(`${data.brand} ${data.model}`);
          });
      }
    });
  }, []);

  useEffect(() => {
    if (isOpen && !isActive && user) {
      joinChannel(carovanaId, user.user_metadata?.username || user.email?.split('@')[0] || 'Unit', carName);
    }
  }, [isOpen, isActive, user, carovanaId, carName, joinChannel]);

  useEffect(() => {
    const channel = supabase.channel(`cruising-alerts-${carovanaId}`);
    channel.on('broadcast', { event: 'road_alert' }, ({ payload }) => {
      setLastAlert({ message: payload.message, sender: payload.sender });
      setTimeout(() => setLastAlert(null), 5000);
    }).subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, [carovanaId]);

  const alerts = [
    { id: 'bump', label: 'DOSSO!', icon: ShieldAlert, color: 'bg-orange-600', msg: 'Attenzione: Dosso alto rilevato!' },
    { id: 'police', label: 'PATTUGLIA', icon: AlertTriangle, color: 'bg-blue-600', msg: 'Segnalata pattuglia sul percorso.' },
    { id: 'stop', label: 'SOSTA', icon: Info, color: 'bg-zinc-700', msg: 'Richiesta sosta tecnica al prossimo autogrill.' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-black flex flex-col touch-none select-none"
        >
          {/* Header */}
          <div className="p-6 flex items-center justify-between border-b border-white/10 bg-zinc-900/50 backdrop-blur-xl pt-[calc(1.5rem+env(safe-area-inset-top))]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                <Radio size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black italic uppercase tracking-tighter">Cruising Mode</h2>
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Channel: {carovanaTitle}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Main Display */}
          <div className="flex-1 p-6 flex flex-col gap-8 overflow-y-auto no-scrollbar">
            <AnimatePresence>
              {lastAlert && (
                <motion.div 
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  className="bg-orange-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/20"
                >
                  <ShieldAlert size={24} className="shrink-0 animate-bounce" />
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-80">Segnalazione da @{lastAlert.sender}</p>
                    <p className="text-xs font-black uppercase italic">{lastAlert.message}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.4em] italic flex items-center gap-2">
                  <Users size={12} /> Unità in Ascolto ({units.length + 1})
                </h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[8px] font-black uppercase text-green-500">Live</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className={cn(
                  "p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between",
                  isSpeaking ? "bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]" : "bg-white/5 border-white/5"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isSpeaking ? "bg-black text-white" : "bg-zinc-800 text-zinc-500")}>
                      <Truck size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase italic">@{user?.user_metadata?.username || 'Tu'}</p>
                      <p className={cn("text-[8px] font-bold uppercase tracking-widest", isSpeaking ? "text-black/60" : "text-zinc-500")}>{carName || 'Il tuo progetto'}</p>
                    </div>
                  </div>
                  {isSpeaking && <div className="flex gap-1"><div className="w-1 h-4 bg-black animate-[bounce_0.6s_infinite]" /><div className="w-1 h-4 bg-black animate-[bounce_0.8s_infinite]" /><div className="w-1 h-4 bg-black animate-[bounce_0.5s_infinite]" /></div>}
                </div>

                {units.map((unit) => (
                  <motion.div 
                    key={unit.id}
                    layout
                    className={cn(
                      "p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between",
                      unit.isSpeaking ? "bg-zinc-100 text-black border-white" : "bg-white/5 border-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", unit.isSpeaking ? "bg-black text-white" : "bg-zinc-800 text-zinc-500")}>
                        <Truck size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase italic">@{unit.username}</p>
                        <p className={cn("text-[8px] font-bold uppercase tracking-widest", unit.isSpeaking ? "text-black/60" : "text-zinc-500")}>{unit.carName || 'Membro District'}</p>
                      </div>
                    </div>
                    {unit.isSpeaking && <Volume2 size={16} className="animate-pulse" />}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-4 mt-auto">
              <h3 className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.4em] italic ml-2">Segnalazioni Rapide</h3>
              <div className="grid grid-cols-3 gap-3">
                {alerts.map((alert) => (
                  <button
                    key={alert.id}
                    onClick={() => sendAlert(alert.id, alert.msg)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-white/5 transition-all active:scale-95",
                      alert.color, "bg-opacity-20 hover:bg-opacity-30"
                    )}
                  >
                    <alert.icon size={20} className="text-white" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white">{alert.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* PTT Button Area */}
          <div className="p-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] bg-zinc-900/80 backdrop-blur-2xl border-t border-white/10 flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                "px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.3em] italic transition-all",
                isSpeaking ? "bg-red-600 text-white animate-pulse" : "bg-zinc-800 text-zinc-500"
              )}>
                {isSpeaking ? 'ON AIR' : 'STANDBY'}
              </div>
            </div>

            <motion.button
              onMouseDown={() => toggleMic(true)}
              onMouseUp={() => toggleMic(false)}
              onTouchStart={(e) => { e.preventDefault(); toggleMic(true); }}
              onTouchEnd={(e) => { e.preventDefault(); toggleMic(false); }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-300 shadow-2xl border-4",
                isSpeaking 
                  ? "bg-white text-black border-white scale-110 shadow-[0_0_50px_rgba(255,255,255,0.3)]" 
                  : "bg-zinc-800 text-zinc-500 border-white/5 hover:bg-zinc-700"
              )}
            >
              {isSpeaking ? <Mic size={40} /> : <MicOff size={40} />}
              <span className="text-[10px] font-black uppercase tracking-widest">PUSH TO TALK</span>
            </motion.button>

            <p className="text-[8px] font-bold uppercase text-zinc-600 tracking-widest text-center max-w-[200px]">
              Tieni premuto per parlare con il convoglio. Rilascia per chiudere la comunicazione.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CruisingMode;