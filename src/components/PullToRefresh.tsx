"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const PullToRefresh = () => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const THRESHOLD = 75; // Soglia ridotta per essere più rapida

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY > 0) return;
    const startY = e.touches[0].pageY;
    
    const handleTouchMove = (moveEvent: TouchEvent) => {
      const currentY = moveEvent.touches[0].pageY;
      const distance = currentY - startY;
      
      if (distance > 0 && window.scrollY === 0) {
        // Più reattivo (meno fatica nel trascinare)
        const resistance = 0.7;
        const pull = distance * resistance;
        setPullDistance(pull);
        
        // Impedisce lo scroll nativo mentre trasciniamo
        if (distance > 5) {
          if (moveEvent.cancelable) moveEvent.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance >= THRESHOLD) {
        triggerRefresh();
      } else {
        setPullDistance(0);
      }
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
  }, [pullDistance]);

  const triggerRefresh = () => {
    setIsRefreshing(true);
    setPullDistance(THRESHOLD);
    
    if ('vibrate' in navigator) navigator.vibrate(10);

    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart);
    return () => window.removeEventListener('touchstart', handleTouchStart);
  }, [handleTouchStart]);

  if (pullDistance === 0 && !isRefreshing) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex justify-center pointer-events-none">
      <motion.div 
        style={{ y: pullDistance - 60 }}
        className="bg-white text-black w-10 h-10 rounded-full shadow-2xl flex items-center justify-center border border-zinc-200"
      >
        <motion.div
          animate={isRefreshing ? { rotate: 360 } : { rotate: pullDistance * 3 }}
          transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { type: "spring", damping: 20 }}
        >
          <RefreshCw size={18} className={pullDistance >= THRESHOLD ? "text-black" : "text-zinc-400"} />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PullToRefresh;