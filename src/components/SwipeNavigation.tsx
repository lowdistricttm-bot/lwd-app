"use client";

import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SwipeNavigation = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  
  // Soglie per il rilevamento dello swipe
  const SWIPE_THRESHOLD = 60;
  const EDGE_THRESHOLD = 40; // Per il "back" stile iOS (partenza dal bordo)
  const ANGLE_THRESHOLD = 30; // Impedisce lo swipe se il movimento è troppo verticale

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;

      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      };

      const deltaX = touchEnd.x - touchStart.current.x;
      const deltaY = touchEnd.y - touchStart.current.y;

      // Verifichiamo che il movimento sia prevalentemente orizzontale
      if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && Math.abs(deltaX) > SWIPE_THRESHOLD) {
        
        // Verifichiamo se l'utente sta interagendo con un elemento che ha lo scroll orizzontale
        const target = e.target as HTMLElement;
        const isSlider = target.closest('.no-scrollbar, .embla, [data-no-swipe="true"]');
        
        if (!isSlider) {
          if (deltaX > 0) {
            // Swipe da Sinistra a Destra -> INDIETRO
            // Spesso limitato alla partenza dal bordo per evitare conflitti
            if (touchStart.current.x < EDGE_THRESHOLD || Math.abs(deltaX) > 100) {
              if ('vibrate' in navigator) navigator.vibrate(5);
              navigate(-1);
            }
          } else {
            // Swipe da Destra a Sinistra -> AVANTI
            if ('vibrate' in navigator) navigator.vibrate(5);
            navigate(1);
          }
        }
      }

      touchStart.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate, location]);

  return <>{children}</>;
};

export default SwipeNavigation;