"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useReviewSeller } from '@/hooks/use-marketplace';
import { useBodyLock } from '@/hooks/use-body-lock';
import { cn } from '@/lib/utils';

interface ReviewSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
}

const ReviewSellerModal = ({ isOpen, onClose, sellerId }: ReviewSellerModalProps) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const { mutateAsync: submitReview, isPending } = useReviewSeller();

  useBodyLock(isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;
    try {
      await submitReview({ sellerId, rating, comment });
      setComment('');
      setRating(5);
      onClose();
    } catch (err) {}
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 z-[300] touch-none" />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} 
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[301] bg-black border-t border-white/10 p-6 rounded-t-[2.5rem] max-h-[85dvh] overflow-y-auto shadow-2xl"
            style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />
            
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-8 pb-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Valuta Venditore</h2>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-1">Lascia un feedback sulla tua esperienza</p>
                </div>
                <button type="button" onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-2 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star 
                        size={36} 
                        className={cn("transition-colors", star <= rating ? "text-yellow-500 fill-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" : "text-zinc-700")} 
                      />
                    </button>
                  ))}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                  <Textarea 
                    value={comment} 
                    onChange={e => setComment(e.target.value)} 
                    placeholder="Scrivi qui la tua recensione (opzionale)..."
                    className="bg-transparent border-none focus-visible:ring-0 p-0 min-h-[100px] text-sm italic text-white placeholder:text-zinc-600 resize-none" 
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="w-full bg-white text-black hover:bg-zinc-200 h-14 rounded-full font-black uppercase italic tracking-[0.2em] transition-all duration-500 shadow-2xl mt-4 border-none"
                >
                  {isPending ? <Loader2 className="animate-spin" /> : <><Send size={18} className="mr-2 -rotate-12" /> Salva Valutazione</>}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReviewSellerModal;