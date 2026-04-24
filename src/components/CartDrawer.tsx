"use client";

import React, { useEffect } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/hooks/use-cart';
import { useBodyLock } from '@/hooks/use-body-lock';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { items, removeFromCart, updateQuantity, total } = useCart();
  const navigate = useNavigate();

  // Blocco background
  useBodyLock(isOpen);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
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
            className="fixed inset-0 bg-black/80 z-[100] touch-none"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-black border-l border-white/10 z-[101] flex flex-col shadow-2xl pt-[env(safe-area-inset-top)]"
            style={{ 
              touchAction: 'pan-y',
              overscrollBehavior: 'contain' 
            }}
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-zinc-400" />
                <h2 className="text-xl font-black italic uppercase tracking-tighter">Carrello</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBag size={48} className="text-zinc-800 mb-4" />
                  <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Il carrello è vuoto</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.id}-${item.variationId}`} className="flex gap-4 group">
                    <div className="w-20 h-24 bg-white/5 border border-white/5 shrink-0 overflow-hidden rounded-xl">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-black uppercase italic truncate mb-1" dangerouslySetInnerHTML={{ __html: item.name }} />
                      {item.size && <p className="text-[10px] text-zinc-500 font-bold uppercase mb-2">Taglia: {item.size}</p>}
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-white/10 bg-white/5 rounded-full overflow-hidden">
                          <button 
                            onClick={() => updateQuantity(item.id, item.variationId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-[10px] font-black">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.variationId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <p className="text-sm font-black tracking-tighter">{(item.price * item.quantity).toFixed(2)} €</p>
                          <button 
                            onClick={() => removeFromCart(item.id, item.variationId)}
                            className="text-zinc-600 hover:text-red-500 transition-colors p-2"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-white/5 bg-white/5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Totale Parziale</span>
                  <span className="text-2xl font-black tracking-tighter italic">{total.toFixed(2)} €</span>
                </div>
                <Button 
                  onClick={handleCheckout}
                  className="w-full bg-white text-black hover:bg-zinc-200 py-6 h-auto text-sm font-black uppercase tracking-widest rounded-full italic transition-all duration-300 shadow-xl"
                >
                  Vai al Checkout
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;