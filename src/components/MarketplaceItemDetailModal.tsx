"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Euro, User, MessageSquare, Calendar, LayoutGrid, ChevronRight, Info, Camera } from 'lucide-react';
import { MarketplaceItem, MARKETPLACE_CATEGORIES } from '@/hooks/use-marketplace';
import { useBodyLock } from '@/hooks/use-body-lock';
import { Button } from './ui/button';
import ImageLightbox from './ImageLightbox';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MarketplaceItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MarketplaceItem;
  isOwnItem: boolean;
  onEdit?: (item: MarketplaceItem) => void;
  onDelete?: (id: string) => void;
}

const MarketplaceItemDetailModal = ({ isOpen, onClose, item, isOwnItem, onEdit, onDelete }: MarketplaceItemDetailModalProps) => {
  const navigate = useNavigate();
  const [lightboxData, setLightboxData] = useState<{ images: string[], index: number } | null>(null);
  
  useBodyLock(isOpen);

  if (!item) return null;

  const categoryLabel = MARKETPLACE_CATEGORIES.find(c => c.id === item.category)?.label || item.category;
  const allImages = item.images || [];

  const handleContact = () => {
    onClose();
    navigate(`/chat/${item.seller_id}`);
  };

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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] touch-none" 
            />
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-[251] bg-zinc-950 border-t border-white/10 p-6 rounded-t-[2.5rem] max-h-[92dvh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
              style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
              
              <div className="max-w-2xl mx-auto space-y-8 pb-[calc(4rem+env(safe-area-inset-bottom))]">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-white text-black text-[8px] font-black uppercase px-2 py-1 italic rounded-lg shadow-lg">
                        {categoryLabel.toUpperCase()}
                      </span>
                      <span className="bg-zinc-800 text-zinc-400 text-[8px] font-black uppercase px-2 py-1 italic rounded-lg border border-white/5">
                        MARKETPLACE
                      </span>
                    </div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none">
                      {item.title}
                    </h3>
                  </div>
                  <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                {/* Gallery */}
                <div className="space-y-4">
                  <div 
                    className="aspect-square bg-zinc-950 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl cursor-pointer group"
                    onClick={() => setLightboxData({ images: allImages, index: 0 })}
                  >
                    {allImages[0] ? (
                      <img src={allImages[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-800"><Tag size={64} /></div>
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

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] backdrop-blur-md">
                    <p className="text-[8px] font-black uppercase text-zinc-500 tracking-[0.3em] italic mb-2">Prezzo Richiesto</p>
                    <div className="flex items-center gap-2 text-white">
                      <Euro size={14} className="text-zinc-400" />
                      <span className="text-xl font-black italic">{item.price}</span>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] backdrop-blur-md">
                    <p className="text-[8px] font-black uppercase text-zinc-500 tracking-[0.3em] italic mb-2">Data Annuncio</p>
                    <div className="flex items-center gap-2 text-white">
                      <Calendar size={14} className="text-zinc-400" />
                      <span className="text-sm font-black uppercase italic">
                        {new Date(item.created_at).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seller Info - Uniformato allo stile iOS Dark */}
                {!isOwnItem && (
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] flex items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-900 rounded-full overflow-hidden border-2 border-white/10">
                        {item.profiles?.avatar_url ? (
                          <img src={item.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-700"><User size={20} /></div>
                        )}
                      </div>
                      <div>
                        <p className="text-[7px] font-black uppercase tracking-widest text-zinc-500">Venditore</p>
                        <p className="text-sm font-black uppercase italic tracking-tight text-white">@{item.profiles?.username}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigate(`/profile/${item.seller_id}`)}
                      className="bg-white text-black hover:bg-zinc-200 rounded-full h-8 px-4 text-[7px] font-black uppercase italic shadow-lg"
                    >
                      Profilo
                    </Button>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-3 px-2">
                  <h4 className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.4em] italic flex items-center gap-2">
                    <Info size={12} /> Descrizione Oggetto
                  </h4>
                  <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden">
                    <p className="text-sm font-medium italic text-zinc-200 leading-relaxed whitespace-pre-wrap relative z-10">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 flex items-center gap-4">
                  {isOwnItem ? (
                    <div className="flex gap-3 w-full">
                      <Button 
                        onClick={() => onEdit?.(item)}
                        className="flex-1 h-16 bg-white text-black rounded-full font-black uppercase italic text-[10px] tracking-widest shadow-xl"
                      >
                        Modifica Annuncio
                      </Button>
                      <Button 
                        onClick={() => onDelete?.(item.id)}
                        variant="destructive"
                        className="h-16 w-16 rounded-full flex items-center justify-center shadow-xl"
                      >
                        <X size={24} />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleContact}
                      className="flex-1 h-16 bg-white text-black hover:bg-zinc-200 rounded-full font-black uppercase italic text-[10px] tracking-widest transition-all duration-500 shadow-xl flex items-center justify-center gap-3"
                    >
                      <MessageSquare size={18} />
                      Contatta il Venditore
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

export default MarketplaceItemDetailModal;