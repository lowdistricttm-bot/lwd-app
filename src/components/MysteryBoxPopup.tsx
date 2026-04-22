"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, ShoppingCart, Ticket, PackageCheck } from 'lucide-react';
import { useMysteryBox } from '@/hooks/use-mystery-box';
import { useCart } from '@/hooks/use-cart';
import { Button } from './ui/button';
import { useLocation } from 'react-router-dom';

const MysteryBoxPopup = () => {
  const location = useLocation();
  const { activeBox, isLoading } = useMysteryBox();
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!activeBox || isLoading) return;

    // Determiniamo la chiave in base alla sezione corrente
    let storageKey = "";
    if (location.pathname === "/") storageKey = "lwd-popup-last-home";
    else if (location.pathname === "/shop") storageKey = "lwd-popup-last-shop";
    else return; // Non mostrare in altre sezioni

    const today = new Date().toDateString();
    const lastDismissed = localStorage.getItem(storageKey);

    // Se non è mai stato chiuso o l'ultima volta era un giorno diverso, mostralo
    if (lastDismissed !== today) {
      const timer = setTimeout(() => setIsOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [activeBox, isLoading, location.pathname]);

  const handleClose = () => {
    setIsOpen(false);
    
    // Salviamo la data di chiusura per la sezione corrente
    const today = new Date().toDateString();
    if (location.pathname === "/") {
      localStorage.setItem("lwd-popup-last-home", today);
    } else if (location.pathname === "/shop") {
      localStorage.setItem("lwd-popup-last-shop", today);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: 999999,
      name: activeBox!.title,
      price: activeBox!.price,
      image: "https://www.lowdistrict.it/wp-content/uploads/new-logo-header-2025.png",
      quantity: 1,
      variationId: undefined
    });
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
          {/* Overlay ultra dark */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-md"
          />

          {/* Modal Content Stealth */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-zinc-950 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,1)]"
          >
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 bg-white/5 text-zinc-600 hover:text-white rounded-full transition-all z-10"
            >
              <X size={20} />
            </button>

            <div className="p-8 md:p-10 space-y-8">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-zinc-900 border border-white/10 rounded-[2rem] flex items-center justify-center rotate-12 shadow-2xl">
                    <Gift size={40} className="-rotate-12 text-zinc-400" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white truncate w-full block">
                    {activeBox.title}
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 italic">
                    Limited Edition Drop
                  </p>
                </div>

                <p className="text-xs text-zinc-500 font-medium leading-relaxed italic">
                  {activeBox.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2 text-center">
                  <PackageCheck size={20} className="text-zinc-400" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Random Products</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2 text-center">
                  <Ticket size={20} className="text-yellow-500" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-yellow-500">Golden Ticket</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div>
                  <p className="text-[8px] font-black uppercase text-zinc-600 tracking-widest mb-1">Prezzo District</p>
                  <p className="text-3xl font-black italic tracking-tighter text-white">€ {activeBox.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase text-red-500 tracking-widest mb-1 animate-pulse">
                    Solo {activeBox.remaining_quantity} rimaste
                  </p>
                  <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(activeBox.remaining_quantity / activeBox.total_quantity) * 100}%` }}
                      className="h-full bg-zinc-700"
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleAddToCart}
                className="w-full bg-zinc-900 text-white hover:bg-zinc-800 h-16 rounded-full font-black uppercase italic tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 border border-white/5"
              >
                <ShoppingCart size={20} />
                Aggiungi al Carrello
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MysteryBoxPopup;