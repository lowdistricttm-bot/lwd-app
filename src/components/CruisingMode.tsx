"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Users, Radio, AlertTriangle, Info, Volume2, ShieldAlert, Zap, User, Power, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useCruising } from '@/hooks/use-cruising';
import { useBodyLock } from '@/hooks/use-body-lock';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";

interface CruisingModeProps {
  isOpen: boolean;
  onClose: () => void;
  carovanaId: string;
  carovanaTitle: string;
}

const CruisingMode = ({ isOpen, onClose, carovanaId, carovanaTitle }: CruisingModeProps) => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<any>(null);
  const [carName, setCarName] = useState<string>('');

  const { 
    isActive, isSpeaking, status, units, lastAlert,
    joinChannel, leaveChannel, toggleMic, sendAlert 
  } = useCruising();

  useBodyLock(isOpen);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single()
          .then(({ data }) => {
            setProfile(data);
          });
          
        supabase.from('vehicles').select('brand, model').eq('user_id', user.id).eq('is_main', true).maybeSingle()
          .then(({ data }) => {
            if (data) setCarName(`${data.brand} ${data.model}`);
          });
      }
    });
  }, []);

  useEffect(() => {
    if (isOpen && !isActive && profile) {
      joinChannel(
        carovanaId, 
        profile.username || 'Unit', 
        profile.avatar_url || '', 
        profile.role || 'member',
        carName
      );
    }
  }, [isOpen, isActive, profile, carovanaId, carName, joinChannel]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      leaveChannel();
    }, 300);
  };

  const getStatusBadge = () => {
    switch(status) {
      case 'initializing': return <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1 rounded-full text-[8px] font-black uppercase text-zinc-400"><Loader2 size={10} className="animate-spin" /> Inizializzazione...</div>;
      case 'connecting': return <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-full text-[8px] font-black uppercase text-blue-400"><Wifi size={10} className="animate-pulse" /> Connessione 5G...</div>;
      case 'ready': return <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full text-[8px] font-black uppercase text-green-500"><Wifi size={10} /> Radio Attiva</div>;
      case 'error': return <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full text-[8px] font-black uppercase text-red-500"><WifiOff size={10} /> Errore Rete</div>;
      default: return null;
    }
  };

  const alerts = [
    { id: 'bump', label: 'DOSSO', icon: ShieldAlert, bgClass: 'bg-orange-500/10', borderClass: 'border-orange-500/30', iconColor: 'text-orange-500', msg: 'ATTENZIONE DOSSO' },
    { id: 'police', label: 'PATTUGLIA', icon: AlertTriangle, bgClass: 'bg-blue-500/10', borderClass: 'border-blue-500/30', iconColor: 'text-blue-500', msg: 'ATTENZIONE PATTUGLIA' },
    { id: 'stop', label: 'SOSTA', icon: Info, bgClass: 'bg-zinc-500/10', borderClass: 'border-zinc-500/30', iconColor: 'text-zinc-400', msg: 'RICHIESTA SOSTA' }
  ];

  const getAlertIcon = (type: string) => {
    switch(type) {
      case 'bump': return <ShieldAlert size={32} />;
      case 'police': return <AlertTriangle size={32} />;
      case 'stop': return <Info size={32} />;
      default: return <Zap size={32} />;
    }
  };

  const getAlertColor = (type: string) => {
    switch(type) {
      case 'bump': return "bg-orange-600 shadow-orange-500/40";
      case 'police': return "bg-blue-600 shadow-blue-500/40";
      case 'stop': return "bg-zinc-700 shadow-white/10";
      default: return "bg-red-600";
    }
  };

  const getRoleLabel = (roleId?: string) => {
    if (!roleId) return 'MEMBRO';
    return (t.profile.roles[roleId] || 'MEMBRO').toUpperCase();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[99999] bg-black flex flex-col touch-none select-none"
        >
          <AnimatePresence>
            {lastAlert && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "absolute inset-0 z-0 opacity-20 blur-[100px] transition-all duration-500",
                  getAlertColor(lastAlert.type)
                )}
              />
            )}
          </AnimatePresence>

          <div className="relative z-10 p-6 flex items-center justify-between border-b border-white/10 bg-zinc-900/50 backdrop-blur-xl pt-[calc(1.5rem+env(safe-area-inset-top))]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 text-black rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                <Radio size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black italic uppercase tracking-tighter">Cruising Mode</h2>
                <div className="mt-1">{getStatusBadge()}</div>
              </div>
            </div>
            
            <button 
              onClick={handleClose} 
              className="w-10 h-10 border border-red-500 text-red-500 bg-transparent rounded-full flex items-center justify-center transition-all hover:bg-red-500/10 active:scale-95"
            >
              <Power size={18} strokeWidth={2} />
            </button>
          </div>

          <div className="relative z-10 flex-1 p-6 flex flex-col gap-8 overflow-y-auto no-scrollbar">
            <div className="min-h-[120px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {lastAlert ? (
                  <motion.div 
                    key="active-alert"
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ scale: 1.1, opacity: 0, y: -20 }}
                    className={cn(
                      "w-full p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-6 border-2 border-white/20",
                      getAlertColor(lastAlert.type)
                    )}
                  >
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shrink-0 animate-bounce">
                      {getAlertIcon(lastAlert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1">Alert da @{lastAlert.sender}</p>
                      <h4 className="text-3xl font-black uppercase italic text-white tracking-tight leading-tight">
                        {lastAlert.message}
                      </h4>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="idle-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center text-center opacity-30 py-8"
                  >
                    <Radio size={48} className="text-zinc-600 mb-4" />
                    <p className="text-[9px] font-black uppercase tracking-[0.4em]">In attesa di comunicazioni...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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

              <div className="grid grid-cols-1 gap-3 pb-6">
                <div className={cn(
                  "p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between",
                  isSpeaking ? "bg-orange-600 text-black border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)]" : "bg-white/5 border-white/5"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-full overflow-hidden border-2", isSpeaking ? "border-black" : "border-white/10")}>
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800"><User size={20} className="text-zinc-600" /></div>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase italic">@{profile?.username || 'Tu'}</p>
                      <p className={cn("text-[9px] font-bold uppercase tracking-widest", isSpeaking ? "text-black/60" : "text-zinc-500")}>
                        {getRoleLabel(profile?.role)}
                      </p>
                    </div>
                  </div>
                  {isSpeaking && <div className="flex gap-1 pr-2"><div className="w-1 h-5 bg-black animate-[bounce_0.6s_infinite]" /><div className="w-1 h-5 bg-black animate-[bounce_0.8s_infinite]" /><div className="w-1 h-5 bg-black animate-[bounce_0.5s_infinite]" /></div>}
                </div>

                {units.map((unit) => (
                  <motion.div 
                    key={unit.id}
                    layout
                    className={cn(
                      "p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between",
                      unit.isSpeaking ? "bg-orange-600/20 text-orange-500 border-orange-500/30" : "bg-white/5 border-white/5"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-full overflow-hidden border-2", unit.isSpeaking ? "border-orange-500" : "border-white/10")}>
                        {unit.avatarUrl ? (
                          <img src={unit.avatarUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-800"><User size={20} className="text-zinc-600" /></div>
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase italic">@{unit.username}</p>
                        <p className={cn("text-[9px] font-bold uppercase tracking-widest", unit.isSpeaking ? "text-orange-500/60" : "text-zinc-500")}>
                          {getRoleLabel(unit.role)}
                        </p>
                      </div>
                    </div>
                    {unit.isSpeaking && <Volume2 size={20} className="animate-pulse mr-2 text-orange-500" />}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-10 px-6 pb-[calc(0.5rem+env(safe-area-inset-bottom))] bg-zinc-900/80 backdrop-blur-2xl border-t border-white/10 flex flex-col items-center gap-12">
            <div className="flex items-center justify-center gap-10">
              {alerts.map((alert) => (
                <button
                  key={alert.id}
                  onClick={() => sendAlert(alert.id, alert.msg)}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div className={cn(
                    "w-16 h-16 rounded-full border-2 flex items-center justify-center group-active:scale-90 transition-all shadow-2xl",
                    alert.bgClass, alert.borderClass
                  )}>
                    <alert.icon size={28} className={alert.iconColor} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    {alert.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="w-12 h-[1px] bg-white/10" />

            <div className="flex flex-col items-center gap-6 w-full">
              <div className={cn(
                "px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.3em] italic transition-all",
                isSpeaking ? "bg-orange-600 text-black" : "bg-zinc-800 text-zinc-500"
              )}>
                {isSpeaking ? 'ON AIR' : 'STANDBY'}
              </div>

              <motion.button
                onMouseDown={() => toggleMic(true)}
                onMouseUp={() => toggleMic(false)}
                onTouchStart={(e) => { e.preventDefault(); toggleMic(true); }}
                onTouchEnd={(e) => { e.preventDefault(); toggleMic(false); }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "w-28 h-28 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-300 shadow-2xl border-4 shrink-0",
                  isSpeaking 
                    ? "bg-orange-600 text-black border-orange-400 scale-110 shadow-[0_0_50px_rgba(249,115,22,0.4)]" 
                    : "bg-zinc-800 text-zinc-500 border-white/5 hover:bg-zinc-700"
                )}
              >
                {isSpeaking ? <Mic size={32} /> : <MicOff size={32} />}
                <span className="text-[9px] font-black uppercase tracking-widest">PTT</span>
              </motion.button>

              <p className="text-[10px] font-bold uppercase text-zinc-600 tracking-widest text-center max-w-[250px]">
                Tieni premuto per parlare. Rilascia per chiudere.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CruisingMode;