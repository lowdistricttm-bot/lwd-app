"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const PullToRefresh = () => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);
  
  const THRESHOLD = 80; // Distanza necessaria per attivare il refresh
  const MAX_PULL = 150; // Distanza massima visibile

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Attiviamo il pull solo se siamo in cima alla pagina
    if (window.scrollY <= 0) {
      startY.current = e.touches[0].pageY;
      isPulling.current = true;
    } else {
      isPulling.current = false;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;

    const currentY = e.touches[0].pageY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      // Applichiamo una resistenza logaritmica per rendere il movimento naturale
      const resistance = 0.4;
      const distance = Math.min(diff * resistance, MAX_PULL);
      
      setPullDistance(distance);

      // Se stiamo tirando verso il basso in cima alla pagina, 
      // impediamo lo scroll nativo (rimbalzo iOS)
      if (e.cancelable) {
        e.preventDefault();
      }
    } else {
      // Se l'utente scorre verso l'alto, resettiamo
      setPullDistance(0);
      isPulling.current = false;
    }
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(() => {
    if (!isPulling.current || isRefreshing) return;

    if (pullDistance >= THRESHOLD) {
      triggerRefresh();
    } else {
      setPullDistance(0);
    }
    isPulling.current = false;
  }, [pullDistance, isRefreshing]);

  const triggerRefresh = () => {
    setIsRefreshing(true);
    setPullDistance(THRESHOLD);
    
    // Feedback aptico (vibrazione breve)
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }

    // Simuliamo il caricamento e ricarichiamo la pagina
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  useEffect(() => {
    // Usiamo { passive: false } per poter chiamare preventDefault()
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <AnimatePresence>
      {(pullDistance > 0 || isRefreshing) && (
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ 
            opacity: pullDistance > 10 ? 1 : 0, 
            y: pullDistance - 60 // Posiziona l'icona sopra il bordo superiore
          }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-[9999] flex justify-center pointer-events-none"
        >
          <div className="bg-white text-black w-12 h-12 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center border border-white/20 backdrop-blur-md">
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : { rotate: pullDistance * 4 }}
              transition={isRefreshing ? { repeat: Infinity, duration: 0.8, ease: "linear" } : { type: "spring", damping: 20 }}
              className={cn(
                "transition-colors duration-300",
                pullDistance >= THRESHOLD ? "text-black" : "text-zinc-400"
              )}
            >
              <RefreshCw size={20} strokeWidth={2.5} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Helper locale per cn se non importato correttamente
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default PullToRefresh;