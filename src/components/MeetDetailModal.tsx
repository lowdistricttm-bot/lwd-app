"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Clock, User, Info, Navigation, Share2, Users, CheckCircle2, Loader2, Lock, Radio } from 'lucide-react';
import { Meet, useMeets } from '@/hooks/use-meets';
import { useBodyLock } from '@/hooks/use-body-lock';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';
import CruisingMode from './CruisingMode';

interface MeetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  meet: Meet;
}

const MeetDetailModal = ({ isOpen, onClose, meet }: MeetDetailModalProps) => {
  const navigate = useNavigate();
  const { toggleParticipation } = useMeets();
  const [isRadioOpen, setIsRadioOpen] = useState(false);
  
  useBodyLock(isOpen);

  if (!meet) return null;

  const handleOpenMap = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meet.location)}`;
    window.open(url, '_blank');
  };

  const handleShare = async () => {
    let url = window.location.href;
    
    if (meet.privacy === 'private' && meet.invite_code) {
      url = `${window.location.origin}/?code=${meet.invite_code}`;
    }
    
    const shareData = {
      title: meet.title,
      text: meet.privacy === 'private' 
        ? `Sei stato invitato al meet privato "${meet.title}" a ${meet.location}!`
        : `Partecipa al meet "${meet.title}" a ${meet.location}!`,
      url: url
    };

    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(url);
        showSuccess(meet.privacy === 'private' ? "Link di invito segreto copiato!" : "Link copiato!");
      }
    } catch (err) {}
  };

  const participants = meet.participants || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-6 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={onClose} className="absolute inset-0 bg-black/80 pointer-events-auto touch-none" 
          />
          <motion.div 
            initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-h-[100dvh] md:max-h-[85vh] md:max-w-2xl bg-black border-t md:border border-white/10 p-6 rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-y-auto shadow-2xl pointer-events-auto"
            style={{ 
              touchAction: 'pan-y', 
              overscrollBehavior: 'contain',
              paddingTop: 'calc(2rem + env(safe-area-inset-top))'
            }}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0 md:hidden" />
            
            <div className="space-y-8 pb-10">
              <div className="flex justify-between items-start">
                <div className="space-y-2 pr-4">
                  <div className="flex gap-2">
                    <span className="bg-white text-black text-[8px] font-black uppercase px-2 py-1 italic rounded-lg shadow-lg">
                      INCONTRO COMMUNITY
                    </span>
                    {meet.privacy === 'private' && (
                      <span className="bg-zinc-800 text-zinc-400 text-[8px] font-black uppercase px-2 py-1 italic rounded-lg flex items-center gap-1">
                        <Lock size={10} /> PRIVATO
                      </span>
                    )}
                  </div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-tight">
                    {meet.title}
                  </h3>
                </div>
                <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors shrink-0">
                  <X size={24} />
                </button>
              </div>

              {meet.image_url && (
                <div className="aspect-video bg-zinc-900 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                  <img src={meet.image_url} className="w-full h-full object-cover" alt={meet.title} />
                </div>
              )}

              {/* Cruising Mode Button - Arancione Sottile con Testo/Icona Neri */}
              {meet.is_participating && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ 
                    scale: [1, 1.02, 1],
                    opacity: 1 
                  }}
                  transition={{
                    scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                    opacity: { duration: 0.5 }
                  }}
                  className="pt-2"
                >
                  <Button 
                    onClick={() => setIsRadioOpen(true)}
                    className="w-full h-14 rounded-full font-black uppercase italic text-[10px] tracking-widest bg-orange-500/90 backdrop-blur-xl text-black border border-orange-400/30 hover:bg-orange-400 transition-all duration-500 shadow-[0_0_30px_rgba(249,115,22,0.2)] flex items-center justify-center gap-3"
                  >
                    <Radio size={22} className="animate-pulse" />
                    WALKIE-TALKIE (RADIO CB)
                  </Button>
                </motion.div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem]">
                  <p className="text-[8px] font-black uppercase text-zinc-500 tracking-[0.3em] italic mb-2">Data e Ora</p>
                  <div className="flex items-center gap-3 text-white">
                    <Calendar size={16} className="text-zinc-400" />
                    <span className="text-sm font-black uppercase italic">
                      {format(new Date(meet.date), 'dd MMMM yyyy', { locale: it })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-white mt-2">
                    <Clock size={16} className="text-zinc-400" />
                    <span className="text-sm font-black uppercase italic">
                      {format(new Date(meet.date), 'HH:mm')}
                    </span>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem]">
                  <p className="text-[8px] font-black uppercase text-zinc-500 tracking-[0.3em] italic mb-2">Luogo Ritrovo</p>
                  <div className="flex items-start gap-3 text-white">
                    <MapPin size={16} className="text-zinc-400 mt-0.5" />
                    <span className="text-sm font-black uppercase italic leading-tight">
                      {meet.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sezione Partecipanti */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.4em] italic flex items-center gap-2">
                    <Users size={12} /> Partecipanti ({participants.length})
                  </h4>
                </div>
                
                {participants.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {participants.map((p, i) => (
                      <button 
                        key={i} 
                        onClick={() => { onClose(); navigate(`/profile/${p.user_id}`); }}
                        className="group relative"
                      >
                        <div className="w-10 h-10 rounded-full border-2 border-white/10 overflow-hidden bg-black group-hover:border-white transition-all">
                          {p.profiles?.avatar_url ? (
                            <img src={p.profiles.avatar_url} className="w-full h-full object-cover" alt={p.profiles.username} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-700"><User size={16} /></div>
                          )}
                        </div>
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white text-black text-[7px] font-black uppercase px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                          {p.profiles?.username}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[9px] font-bold uppercase text-zinc-600 italic">Nessun partecipante ancora. Sii il primo!</p>
                )}
              </div>

              <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-full overflow-hidden border-2 border-white/10">
                    {meet.profiles?.avatar_url ? (
                      <img src={meet.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700"><User size={20} /></div>
                    )}
                  </div>
                  <div>
                    <p className="text-[7px] font-black uppercase tracking-widest text-zinc-500">Organizzato da</p>
                    <p className="text-sm font-black uppercase italic tracking-tight text-white">@{meet.profiles?.username}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 px-2">
                <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.4em] italic flex items-center gap-2">
                  <Info size={12} /> Descrizione e Programma
                </h4>
                <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem]">
                  <p className="text-sm font-medium italic text-zinc-200 leading-relaxed whitespace-pre-wrap">
                    {meet.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => toggleParticipation.mutate(meet.id)}
                    disabled={toggleParticipation.isPending}
                    className={cn(
                      "flex-1 h-16 rounded-full font-black uppercase italic text-[10px] tracking-widest transition-all duration-500 shadow-xl flex items-center justify-center gap-3 border",
                      meet.is_participating 
                        ? "bg-zinc-800 text-white border-white/10 hover:bg-red-600 hover:border-red-600" 
                        : "bg-white text-black border-white hover:bg-zinc-200 hover:scale-105"
                    )}
                  >
                    {toggleParticipation.isPending ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : meet.is_participating ? (
                      <>ANNULLA PARTECIPAZIONE</>
                    ) : (
                      <>PARTECIPA ALL'INCONTRO</>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={handleOpenMap}
                    variant="outline"
                    className="flex-1 h-16 rounded-full font-black uppercase italic text-[10px] tracking-widest border-white/10 text-white hover:bg-white/5 flex items-center justify-center gap-3 hover:scale-105 transition-transform"
                  >
                    <Navigation size={18} />
                    PORTAMI LÌ
                  </Button>
                </div>
                
                <Button 
                  onClick={handleShare}
                  variant="ghost"
                  className="h-12 rounded-full font-black uppercase italic text-[9px] tracking-widest text-zinc-500 hover:text-white flex items-center justify-center gap-2"
                >
                  <Share2 size={16} /> CONDIVIDI INCONTRO
                </Button>
              </div>

              <CruisingMode 
                isOpen={isRadioOpen} 
                onClose={() => setIsRadioOpen(false)} 
                carovanaId={meet.id} 
                carovanaTitle={meet.title} 
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MeetDetailModal;