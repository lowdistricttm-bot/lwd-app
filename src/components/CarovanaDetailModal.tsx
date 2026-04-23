"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Users, Car, ChevronRight, Loader2, Trash2, Share2, Info, Navigation, Edit3, Lock, Radio } from 'lucide-react';
import { Carovana, useCarovane } from '@/hooks/use-carovane';
import { useGarage } from '@/hooks/use-garage';
import { useBodyLock } from '@/hooks/use-body-lock';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';
import CruisingMode from './CruisingMode';

interface CarovanaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  carovana: Carovana;
  currentUserId: string | null;
  onEdit?: (carovana: Carovana) => void;
}

const WalkieTalkieIcon = ({ className }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 10v8a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2Z" />
    <path d="M12 12v3" />
    <path d="M11 6V3" />
    <path d="M13 8V5" />
  </svg>
);

const CarovanaDetailModal = ({ isOpen, onClose, carovana, currentUserId, onEdit }: CarovanaDetailModalProps) => {
  const navigate = useNavigate();
  const { toggleJoin, deleteCarovana } = useCarovane();
  const { vehicles } = useGarage();
  const [isCruisingOpen, setIsCruisingOpen] = useState(false);
  
  useBodyLock(isOpen);

  if (!carovana) return null;

  const isCreator = currentUserId === carovana.creator_id;
  const participants = carovana.carovane_partecipanti || [];

  const handleJoin = async () => {
    // Seleziona automaticamente il veicolo principale o il primo disponibile
    const mainVehicle = vehicles?.find(v => v.is_main) || vehicles?.[0];
    await toggleJoin.mutateAsync({ carovanaId: carovana.id, vehicleId: mainVehicle?.id });
  };

  const handleShare = async () => {
    let shareUrl = `${window.location.origin}/events?carovana_id=${carovana.id}`;
    
    // Se la carovana è privata, usiamo il link con il codice di invito
    if (carovana.privacy === 'private' && carovana.invite_code) {
      shareUrl = `${window.location.origin}/?code=${carovana.invite_code}`;
    }

    const shareData = {
      title: carovana.title,
      text: carovana.privacy === 'private'
        ? `Unisciti alla mia carovana segreta! Partenza da ${carovana.start_location}`
        : `Unisciti alla mia carovana per l'evento! Partenza da ${carovana.start_location}`,
      url: shareUrl
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showSuccess(carovana.privacy === 'private' ? "Link di invito segreto copiato!" : "Link carovana copiato!");
      }
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
            className="fixed inset-0 bg-black/80 z-[250] touch-none"
            data-no-swipe="true"
          />
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[251] bg-black border-t border-white/10 p-6 rounded-t-[2.5rem] h-[100dvh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
            style={{ 
              touchAction: 'pan-y', 
              overscrollBehavior: 'contain',
              paddingTop: 'calc(2rem + env(safe-area-inset-top))'
            }}
            data-no-swipe="true"
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 shrink-0" />
            
            <div className="max-w-2xl mx-auto space-y-8 pb-10">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <span className="bg-white text-black text-[8px] font-black uppercase px-2 py-1 italic rounded-lg shadow-lg">
                      RUN TO THE SHOW
                    </span>
                    {carovana.privacy === 'private' && (
                      <span className="bg-zinc-800 text-zinc-400 text-[8px] font-black uppercase px-2 py-1 italic rounded-lg flex items-center gap-1">
                        <Lock size={10} /> PRIVATA
                      </span>
                    )}
                  </div>
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
                  <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors shrink-0"><X size={24} /></button>
                </div>
              </div>

              {/* Cruising Mode Button - Arancione con Walkie Talkie */}
              {carovana.is_joined && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="pt-2"
                >
                  <Button 
                    onClick={() => setIsCruisingOpen(true)}
                    className="w-full h-16 rounded-full font-black uppercase italic text-[10px] tracking-widest bg-orange-600 text-white border-orange-500 hover:bg-orange-500 hover:scale-[1.02] transition-all duration-500 shadow-xl flex items-center justify-center gap-3"
                  >
                    <WalkieTalkieIcon className="animate-pulse" />
                    WALKIE-TALKIE (RADIO CB)
                  </Button>
                </motion.div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem]">
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

                <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem]">
                  <p className="text-[8px] font-black uppercase text-zinc-500 tracking-[0.3em] italic mb-2">Organizzatore</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-black border border-white/10">
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
                        <div className="w-4 h-4 rounded-full bg-white border-4 border-black mt-1 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
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
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-black border border-white/10">
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
                    <Navigation size={16} /> NAVIGA ALLA PARTENZA
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

      <CruisingMode 
        isOpen={isCruisingOpen} 
        onClose={() => setIsCruisingOpen(false)} 
        carovanaId={carovana.id} 
        carovanaTitle={carovana.title} 
      />
    </AnimatePresence>
  );
};

export default CarovanaDetailModal;