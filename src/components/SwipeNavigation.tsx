"use client";

import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SwipeNavigation = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  
  const SWIPE_THRESHOLD = 70;
  const EDGE_THRESHOLD = 30; 
  const HORIZONTAL_RATIO = 2.0;

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      // Ignora se il tocco inizia su elementi con data-no-swipe (Navbar, BottomNav)
      if (target.closest('[data-no-swipe="true"]')) {
        touchStart.current = null;
        return;
      }

      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;

      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
        time: Date.now()
      };

      const deltaX = touchEnd.x - touchStart.current.x;
      const deltaY = touchEnd.y - touchStart.current.y;
      const duration = touchEnd.time - touchStart.current.time;

      if (duration > 500) return; 
      
      if (Math.abs(deltaX) > Math.abs(deltaY) * HORIZONTAL_RATIO && Math.abs(deltaX) > SWIPE_THRESHOLD) {
        
        const target = e.target as HTMLElement;
        // Aggiunto controllo per evitare swipe navigation se siamo dentro il visualizzatore storie o barre fisse
        const isRestricted = target.closest('.no-scrollbar, .embla, [data-no-swipe="true"], input, textarea, [role="dialog"]');
        
        if (!isRestricted) {
          if (deltaX > 0) {
            if (touchStart.current.x < EDGE_THRESHOLD || Math.abs(deltaX) > 120) {
              if ('vibrate' in navigator) navigator.vibrate(5);
              navigate(-1);
            }
          } else {
            if (Math.abs(deltaX) > 120) {
              if ('vibrate' in navigator) navigator.vibrate(5);
              navigate(1);
            }
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