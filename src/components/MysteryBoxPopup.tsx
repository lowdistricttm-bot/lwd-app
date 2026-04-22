"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Sparkles, ShoppingCart, Ticket, PackageCheck } from 'lucide-react';
import { useMysteryBox } from '@/hooks/use-mystery-box';
import { useCart } from '@/hooks/use-cart';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const MysteryBoxPopup = () => {
  const { activeBox, isLoading } = useMysteryBox();
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    if (activeBox && !hasDismissed) {
      const timer = setTimeout(() => setIsOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [activeBox, hasDismissed]);

  if (!activeBox || isLoading) return null;

  const handleAddToCart = () => {
    addToCart({
      id: 999999, // ID virtuale per la Mystery Box
      name: activeBox.title,
      price: activeBox.price,
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2040&auto=format&fit=crop",
      quantity: 1,
      variationId: undefined
    });
    setIsOpen(false);
    setHasDismissed(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-24 left-6 right-6 z-[100] md:left-auto md:right-8 md:bottom-24 md:w-96"
        >
          <div className="bg-white text-black rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(255,255,255,0.1)] border border-white/20 relative">
            {/* Header Image */}
            <div className="h-40 bg-zinc-900 relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2040&auto=format&fit=crop" 
                className="w-full h-full object-cover opacity-60 grayscale"
                alt="Mystery Box"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute top-4 left-4 bg-white text-black px-3 py-1 rounded-full text-[10px] font-black italic shadow-xl">
                LIMITED EDITION
              </div>
              <button 
                onClick={() => { setIsOpen(false); setHasDismissed(true); }}
                className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white rotate-12 shadow-xl">
                    <Gift size={24} className="-rotate-12" />
                  </div>
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">{activeBox.title}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 leading-relaxed">
                  {activeBox.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-100 flex items-center gap-3">
                  <PackageCheck size={16} className="text-zinc-400" />
                  <span className="text-[9px] font-black uppercase italic">Detailing Gear</span>
                </div>
                <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-100 flex items-center gap-3">
                  <Ticket size={16} className="text-yellow-600" />
                  <span className="text-[9px] font-black uppercase italic">Golden Ticket?</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                <div>
                  <p className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">Prezzo Fisso</p>
                  <p className="text-3xl font-black italic tracking-tighter">€ {activeBox.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black uppercase text-red-500 tracking-widest animate-pulse">Solo {activeBox.remaining_quantity} rimaste</p>
                  <p className="text-[8px] font-bold text-zinc-400 uppercase">Su {activeBox.total_quantity} totali</p>
                </div>
              </div>

              <Button 
                onClick={handleAddToCart}
                className="w-full bg-black text-white hover:bg-zinc-800 h-14 rounded-full font-black uppercase italic tracking-widest shadow-xl transition-all flex items-center justify-center gap-3"
              >
                <ShoppingCart size={18} />
                Aggiungi al Carrello
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MysteryBoxPopup;