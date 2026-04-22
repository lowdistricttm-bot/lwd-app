"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const PullToRefresh = () => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);
  
  const THRESHOLD = 80; 
  const MAX_PULL = 150; 

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Disattiviamo se il body ha overflow hidden (storie o modal aperti)
    if (document.body.style.overflow === 'hidden') {
      isPulling.current = false;
      return;
    }

    const target = e.target as HTMLElement;
    // Ignora se il tocco inizia sulla Navbar o BottomNav
    if (target.closest('[data-no-swipe="true"]')) {
      isPulling.current = false;
      return;
    }

    if (window.scrollY <= 5) {
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
      const resistance = 0.4;
      const distance = Math.min(diff * resistance, MAX_PULL);
      
      setPullDistance(distance);

      if (distance > 10 && e.cancelable) {
        e.preventDefault();
      }
    } else {
      isPulling.current = false;
      setPullDistance(0);
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
    
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }

    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  useEffect(() => {
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
            y: pullDistance - 60 
          }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-[9999] flex justify-center pointer-events-none"
        >
          <div className="bg-white text-black w-12 h-12 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center border border-white/20 backdrop-blur-md">
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : { rotate: pullDistance * 4 }}
              transition={isRefreshing ? { repeat: Infinity, duration: 0.8, ease: "linear" } : { type: "spring", damping: 20 }}
              className={pullDistance >= THRESHOLD ? "text-black" : "text-zinc-400"}
            >
              <RefreshCw size={20} strokeWidth={2.5} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PullToRefresh;