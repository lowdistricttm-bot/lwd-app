"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Users, Car, ChevronRight, Loader2, Trash2, Share2, Info, Navigation, Edit3 } from 'lucide-react';
import { Carovana, useCarovane } from '@/hooks/use-carovane';
import { useGarage } from '@/hooks/use-garage';
import { useBodyLock } from '@/hooks/use-body-lock';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface CarovanaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  carovana: Carovana;
  currentUserId: string | null;
  onEdit?: (carovana: Carovana) => void;
}

const CarovanaDetailModal = ({ isOpen, onClose, carovana, currentUserId, onEdit }: CarovanaDetailModalProps) => {
  const navigate = useNavigate();
  const { toggleJoin, deleteCarovana } = useCarovane();
  const { vehicles } = useGarage();
  
  // Blocca lo scroll del body in modo definitivo
  useBodyLock(isOpen);

  if (!carovana) return null;

  const isCreator = currentUserId === carovana.creator_id;
  const participants = carovana.carovane_partecipanti || [];

  const handleJoin = async () => {
    const mainVehicle = vehicles?.find(v => v.is_main) || vehicles?.[0];
    await toggleJoin.mutateAsync({ carovanaId: carovana.id, vehicleId: mainVehicle?.id });
  };

  const handleShare = async () => {
    const shareData = {
      title: carovana.title,
      text: `Unisciti alla mia carovana per l'evento! Partenza da ${carovana.start_location}`,
      url: window.location.href
    };
    try {
      if (navigator.share) await navigator.share(shareData);
    } catch (err) {}
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] touch-none"
            data-no-swipe="true"
          />
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[251] bg-zinc-950 border-t border-white/10 p-6 rounded-t-[2.5rem] max-h-[92dvh] overflow-y-auto shadow-2xl"
            style={{ 
              touchAction: 'pan-y', 
              overscrollBehavior: 'contain' 
            }}
            data-no-swipe="true"
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
            
            <div className="max-w-2xl mx-auto space-y-8 pb-10">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <span className="bg-white text-black text-[8px] font-black uppercase px-2 py-1 italic rounded-lg shadow-lg">
                    RUN TO THE SHOW
                  </span>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-tight">
                    {carovana.title}
                  </h3>
                </div>
                <div className="flex gap-2">
                  {isCreator && (
                    <>
                      <button 
                        onClick={() => onEdit?.(carovana)} 
                        className="p-2 bg-white/5 text-zinc-400 rounded-full hover:bg-white hover:text-black transition-all"
                      >
                        <Edit3 size={20} />
                      </button>
                      <button 
                        onClick={() => { if(confirm("Eliminare carovana?")) { deleteCarovana.mutate(carovana.id); onClose(); } }} 
                        className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </>
                  )}
                  <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={24} /></button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] backdrop-blur-md">
                  <p className="text-[8px] font-black uppercase text-zinc-500 tracking-[0.3em] italic mb-2">Partenza</p>
                  <div className="flex items-center gap-3 text-white mb-2">
                    <MapPin size={16} className="text-zinc-400" />
                    <span className="text-sm font-black uppercase italic">{carovana.start_location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <Clock size={16} className="text-zinc-400" />
                    <span className="text-sm font-black uppercase italic">
                      {format(new Date(carovana.start_time), 'dd MMM - HH:mm', { locale: it }).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] backdrop-blur-md">
                  <p className="text-[8px] font-black uppercase text-zinc-500 tracking-[0.3em] italic mb-2">Organizzatore</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-900 border border-white/10">
                      {carovana.profiles?.avatar_url ? <img src={carovana.profiles.avatar_url} className="w-full h-full object-cover" /> : <Users size={20} className="m-auto h-full text-zinc-700" />}
                    </div>
                    <span className="text-sm font-black uppercase italic text-white">@{carovana.profiles?.username}</span>
                  </div>
                </div>
              </div>

              {carovana.carovane_tappe && carovana.carovane_tappe.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.4em] italic ml-4">Tappe del Viaggio</h4>
                  <div className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] space-y-6 relative">
                    <div className="absolute left-8 top-10 bottom-10 w-[1px] bg-white/10" />
                    {carovana.carovane_tappe.map((stop, i) => (
                      <div key={stop.id} className="flex items-start gap-6 relative z-10">
                        <div className="w-4 h-4 rounded-full bg-white border-4 border-zinc-900 mt-1 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-black uppercase italic text-white">{stop.location}</p>
                            {stop.arrival_time && (
                              <span className="text-[9px] font-black uppercase text-zinc-500 bg-white/5 px-2 py-0.5 rounded-md">
                                {format(new Date(stop.arrival_time), 'HH:mm')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.4em] italic ml-4">Partecipanti ({participants.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {participants.map((p, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-900 border border-white/10">
                        {p.profiles?.avatar_url ? <img src={p.profiles.avatar_url} className="w-full h-full object-cover" /> : <Users size={16} className="m-auto h-full text-zinc-700" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase italic text-white truncate">@{p.profiles?.username}</p>
                        <p className="text-[8px] font-bold uppercase text-zinc-500 truncate">{p.vehicles?.brand} {p.vehicles?.model}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {carovana.route_description && (
                <div className="space-y-3 px-2">
                  <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.4em] italic flex items-center gap-2">
                    <Info size={12} /> Info Percorso
                  </h4>
                  <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem]">
                    <p className="text-sm font-medium italic text-zinc-200 leading-relaxed whitespace-pre-wrap">
                      {carovana.route_description}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-6 flex flex-col gap-4">
                <Button 
                  onClick={handleJoin}
                  disabled={toggleJoin.isPending}
                  className={cn(
                    "h-16 rounded-full font-black uppercase italic text-[10px] tracking-widest transition-all duration-500 shadow-xl flex items-center justify-center gap-3 border",
                    carovana.is_joined 
                      ? "bg-zinc-800 text-white border-white/10 hover:bg-red-600 hover:border-red-600" 
                      : "bg-white text-black border-white hover:bg-zinc-200"
                  )}
                >
                  {toggleJoin.isPending ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : carovana.is_joined ? (
                    <>ABBANDONA CAROVANA</>
                  ) : (
                    <>UNISCITI ALLA CAROVANA</>
                  )}
                </Button>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(carovana.start_location)}`, '_blank')}
                    variant="outline"
                    className="flex-1 h-14 rounded-full font-black uppercase italic text-[9px] tracking-widest border-white/10 text-white hover:bg-white/5 flex items-center justify-center gap-2"
                  >
                    <Navigation size={16} /> NAVIGA AL MEETING
                  </Button>
                  <Button 
                    onClick={handleShare}
                    variant="outline"
                    className="flex-1 h-14 rounded-full font-black uppercase italic text-[9px] tracking-widest border-white/10 text-white hover:bg-white/5 flex items-center justify-center gap-2"
                  >
                    <Share2 size={16} /> CONDIVIDI
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CarovanaDetailModal;