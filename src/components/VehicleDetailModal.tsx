"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Car, Calendar, Gauge, Heart, CreditCard, Info, ChevronRight, Sparkles } from 'lucide-react';
import { Vehicle } from '@/hooks/use-garage';
import { useAdmin } from '@/hooks/use-admin';
import { useBodyLock } from '@/hooks/use-body-lock';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import ImageLightbox from './ImageLightbox';
import VehicleStats from './VehicleStats';

interface VehicleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  isOwnProfile: boolean;
  onLike: (id: string) => void;
  currentUserId: string | null;
}

const VehicleDetailModal = ({ isOpen, onClose, vehicle, isOwnProfile, onLike, currentUserId }: VehicleDetailModalProps) => {
  const { canVote } = useAdmin();
  const [lightboxData, setLightboxData] = useState<{ images: string[], index: number } | null>(null);
  
  useBodyLock(isOpen);

  if (!vehicle) return null;

  const isPublic = vehicle.profiles?.license_plate_privacy === 'public';
  const canSeePlate = isOwnProfile || canVote || isPublic;
  const allImages = vehicle.images || (vehicle.image_url ? [vehicle.image_url] : []);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={onClose} 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] touch-none" 
            />
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-[201] bg-black/60 backdrop-blur-2xl border-t border-white/10 p-6 rounded-t-[2.5rem] max-h-[92dvh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
              style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
              
              <div className="max-w-2xl mx-auto space-y-8 pb-[calc(4rem+env(safe-area-inset-bottom))]">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-white text-black text-[8px] font-black uppercase px-2 py-1 italic rounded-lg shadow-lg">
                        {vehicle.suspension_type}
                      </span>
                      {vehicle.is_main && (
                        <span className="bg-zinc-800 text-zinc-400 text-[8px] font-black uppercase px-2 py-1 italic rounded-lg border border-white/5">
                          PROGETTO ATTIVO
                        </span>
                      )}
                      {vehicle.stance_score && (
                        <span className="bg-black/60 text-white border border-white/20 text-[8px] font-black uppercase px-2 py-1 italic rounded-lg flex items-center gap-1.5">
                          <Sparkles size={10} /> LOW SCORE: {vehicle.stance_score}
                        </span>
                      )}
                    </div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none">
                      {vehicle.brand} {vehicle.model}
                    </h3>
                  </div>
                  <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div 
                    className="aspect-video bg-zinc-950 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl cursor-pointer group"
                    onClick={() => setLightboxData({ images: allImages, index: 0 })}
                  >
                    {allImages[0] ? (
                      <img src={allImages[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-800"><Car size={64} /></div>
                    )}
                  </div>

                  {allImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-3">
                      {allImages.slice(1, 5).map((img, idx) => (
                        <div 
                          key={idx} 
                          className="aspect-square bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 cursor-pointer relative group"
                          onClick={() => setLightboxData({ images: allImages, index: idx + 1 })}
                        >
                          <img src={img} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" alt="" />
                          {idx === 3 && allImages.length > 5 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-xs font-black">+{allImages.length - 5}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] backdrop-blur-md">
                    <p className="text-[8px] font-black uppercase text-zinc-500 tracking-[0.3em] italic mb-2">Anno Progetto</p>
                    <div className="flex items-center gap-2 text-white">
                      <Calendar size={14} className="text-zinc-400" />
                      <span className="text-sm font-black uppercase italic">{vehicle.year || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] backdrop-blur-md">
                    <p className="text-[8px] font-black uppercase text-zinc-500 tracking-[0.3em] italic mb-2">Assetto</p>
                    <div className="flex items-center gap-2 text-white">
                      <Gauge size={14} className="text-zinc-400" />
                      <span className="text-sm font-black uppercase italic">{vehicle.suspension_type}</span>
                    </div>
                  </div>
                  {vehicle.license_plate && canSeePlate && (
                    <div className="col-span-2 bg-white text-black p-5 rounded-[2rem] flex items-center justify-between shadow-xl">
                      <div className="flex items-center gap-3">
                        <CreditCard size={20} />
                        <div>
                          <p className="text-[7px] font-black uppercase tracking-widest opacity-60">Targa Veicolo</p>
                          <p className="text-lg font-black uppercase italic tracking-widest">{vehicle.license_plate}</p>
                        </div>
                      </div>
                      {!isPublic && isOwnProfile && (
                        <span className="text-[7px] font-black uppercase bg-black/10 px-2 py-1 rounded-md">Privata</span>
                      )}
                    </div>
                  )}
                </div>

                {isOwnProfile && (
                  <div className="pt-4">
                    <VehicleStats vehicleId={vehicle.id} />
                  </div>
                )}

                {vehicle.description && (
                  <div className="space-y-3 px-2">
                    <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.4em] italic flex items-center gap-2">
                      <Info size={12} /> Descrizione Progetto
                    </h4>
                    <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden">
                      <p className="text-sm font-medium italic text-zinc-200 leading-relaxed whitespace-pre-wrap relative z-10">
                        {vehicle.description}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-6 flex items-center gap-4">
                  <Button 
                    onClick={() => !isOwnProfile && onLike(vehicle.id)}
                    className={cn(
                      "flex-1 h-16 rounded-full font-black uppercase italic text-[10px] tracking-widest transition-all duration-500 shadow-xl border",
                      vehicle.is_liked ? "bg-red-500 border-red-500 text-white" : "bg-white/5 border-white/10 text-white hover:bg-white/10",
                      isOwnProfile && "cursor-default opacity-80"
                    )}
                  >
                    <Heart size={18} className="mr-2" fill={vehicle.is_liked ? "currentColor" : "none"} />
                    {isOwnProfile ? 'Apprezzamenti' : vehicle.is_liked ? 'Ti piace' : 'Metti Like'} ({vehicle.likes_count || 0})
                  </Button>
                  
                  {!isOwnProfile && (
                    <Button 
                      onClick={() => { onClose(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-xl"
                    >
                      <ChevronRight size={24} />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ImageLightbox 
        images={lightboxData?.images || []} 
        initialIndex={lightboxData?.index || 0} 
        isOpen={!!lightboxData} 
        onClose={() => setLightboxData(null)} 
      />
    </>
  );
};

export default VehicleDetailModal;