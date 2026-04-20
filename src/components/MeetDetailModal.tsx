"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Clock, User, Info, Navigation, Share2 } from 'lucide-react';
import { Meet } from '@/hooks/use-meets';
import { useBodyLock } from '@/hooks/use-body-lock';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface MeetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  meet: Meet;
}

const MeetDetailModal = ({ isOpen, onClose, meet }: MeetDetailModalProps) => {
  useBodyLock(isOpen);

  if (!meet) return null;

  const handleOpenMap = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meet.location)}`;
    window.open(url, '_blank');
  };

  const handleShare = async () => {
    const shareData = {
      title: meet.title,
      text: `Partecipa al meet "${meet.title}" a ${meet.location}!`,
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] touch-none" 
          />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[201] bg-zinc-950 border-t border-white/10 p-6 rounded-t-[2.5rem] max-h-[90dvh] overflow-y-auto shadow-2xl"
            style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
            
            <div className="max-w-2xl mx-auto space-y-8 pb-10">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <span className="bg-white text-black text-[8px] font-black uppercase px-2 py-1 italic rounded-lg shadow-lg">
                    INCONTRO COMMUNITY
                  </span>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-tight">
                    {meet.title}
                  </h3>
                </div>
                <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              {meet.image_url && (
                <div className="aspect-video bg-zinc-900 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                  <img src={meet.image_url} className="w-full h-full object-cover" alt={meet.title} />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] backdrop-blur-md">
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

                <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] backdrop-blur-md">
                  <p className="text-[8px] font-black uppercase text-zinc-500 tracking-[0.3em] italic mb-2">Luogo Ritrovo</p>
                  <div className="flex items-start gap-3 text-white">
                    <MapPin size={16} className="text-zinc-400 mt-0.5" />
                    <span className="text-sm font-black uppercase italic leading-tight">
                      {meet.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-900 rounded-full overflow-hidden border-2 border-white/10">
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

              <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleOpenMap}
                  className="flex-1 h-16 bg-white text-black hover:bg-zinc-200 rounded-full font-black uppercase italic text-[10px] tracking-widest transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  <Navigation size={18} />
                  Apri Navigatore
                </Button>
                <Button 
                  onClick={handleShare}
                  variant="outline"
                  className="h-16 w-full sm:w-16 rounded-full flex items-center justify-center border-white/10 text-white hover:bg-white/5"
                >
                  <Share2 size={20} />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MeetDetailModal;