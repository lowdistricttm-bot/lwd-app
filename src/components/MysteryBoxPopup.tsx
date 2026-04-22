"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, ShoppingCart, Ticket, PackageCheck, Sparkles, Box } from 'lucide-react';
import { useMysteryBox } from '@/hooks/use-mystery-box';
import { useCart } from '@/hooks/use-cart';
import { Button } from './ui/button';
import Logo from './Logo';
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
      id: 999999,
      name: activeBox.title,
      price: activeBox.price,
      image: "https://www.lowdistrict.it/wp-content/uploads/new-logo-header-2025.png",
      quantity: 1,
      variationId: undefined
    });
    setIsOpen(false);
    setHasDismissed(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
          {/* Overlay Scuro */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setIsOpen(false); setHasDismissed(true); }}
            className="absolute inset-0 bg-black/95 backdrop-blur-md"
          />

          {/* Modal Content - Street Style */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative w-full max-w-md bg-zinc-950 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,1)]"
          >
            {/* Visual Hero: The Underground Box */}
            <div className="relative h-56 bg-black flex items-center justify-center overflow-hidden border-b border-white/5">
              {/* Background: Moody Garage/Street vibe */}
              <img 
                src="https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070&auto=format&fit=crop" 
                className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale scale-110"
                alt=""
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
              
              {/* The Virtual Box with Logo */}
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                  rotateY: [-5, 5, -5]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 w-40 h-40 bg-zinc-900 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col items-center justify-center p-4"
                style={{ perspective: '1000px' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />
                <Logo variant="white" className="h-10 opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] mb-2" />
                <div className="w-full h-[1px] bg-white/10 my-2" />
                <span className="text-[7px] font-black uppercase tracking-[0.4em] text-zinc-600 italic">Official Supply</span>
                
                {/* Box Details (Tape effect) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-full bg-black/40 border-x border-white/5" />
              </motion.div>

              <button 
                onClick={() => { setIsOpen(false); setHasDismissed(true); }}
                className="absolute top-6 right-6 p-2 bg-white/5 text-zinc-500 hover:text-white rounded-full transition-all z-20"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 md:p-10 space-y-8">
              <div className="text-center space-y-4">
                <div className="space-y-1">
                  <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white truncate block leading-none">
                    {activeBox.title}
                  </h3>
                  <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-600 italic">
                    Limited Underground Drop
                  </p>
                </div>

                <p className="text-xs text-zinc-500 font-medium leading-relaxed italic px-4">
                  {activeBox.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2 text-center group hover:bg-white/10 transition-colors">
                  <PackageCheck size={20} className="text-zinc-500 group-hover:text-white transition-colors" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Detailing Gear</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2 text-center group hover:bg-white/10 transition-colors">
                  <Ticket size={20} className="text-yellow-500 animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Golden Ticket</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div>
                  <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest mb-1 italic">District Price</p>
                  <p className="text-4xl font-black italic tracking-tighter text-white">€ {activeBox.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase text-red-600 tracking-widest animate-pulse mb-1">Solo {activeBox.remaining_quantity} rimaste</p>
                  <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(activeBox.remaining_quantity / activeBox.total_quantity) * 100}%` }}
                      className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleAddToCart}
                className="w-full bg-white text-black hover:bg-zinc-200 h-16 rounded-full font-black uppercase italic tracking-widest shadow-[0_10px_30px_rgba(255,255,255,0.1)] transition-all flex items-center justify-center gap-3 border-none"
              >
                <ShoppingCart size={20} />
                Prendi la Box
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MysteryBoxPopup;